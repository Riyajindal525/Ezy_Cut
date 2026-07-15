const Payment = require("../models/payment.model");
const Salon = require("../models/salon.model");
const Service = require("../models/service.model");
const Booking = require("../models/booking.model");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const { createBookingInternal } = require("./booking.service");
const { createNotificationService } = require("./notification.service");

/* ─── Trigger thresholds ────────────────────────────────────────── */
const PENDING_ACCEPTANCE_TIMEOUT_MINUTES = 30; // Auto-refund if owner doesn't accept within this time
const PAYMENT_TIMEOUT_MINUTES = 10;             // Auto-refund paid-but-no-booking payments after this

/* ─── Create Razorpay Order ─────────────────────────────────────── */

const createOrderService = async (data, customerId) => {
  const { salonId, serviceId, bookingDate, startTime, notes } = data;

  const salon = await Salon.findById(salonId);
  if (!salon) throw new Error("Salon not found");
  if (!salon.isApproved) throw new Error("Salon not approved");

  const service = await Service.findById(serviceId);
  if (!service) throw new Error("Service not found");

  const amount = service.price * 100;

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  const payment = await Payment.create({
    customer: customerId,
    salon: salonId,
    service: serviceId,
    amount: service.price,
    razorpayOrderId: order.id,
    metadata: { bookingDate, startTime, notes },
  });

  return {
    paymentId: payment._id,
    orderId: order.id,
    amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
  };
};

/* ─── Verify Payment & Create Booking ───────────────────────────── */

const verifyPaymentService = async (data) => {
  const {
    paymentId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = data;

  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error("Payment not found");

  // ── Duplicate payment guard ───────────────────────────────────
  // If this order was already paid (e.g., double submission), auto-refund the new payment
  if (payment.status === "paid") {
    console.warn(`[DUPLICATE] Order ${razorpay_order_id} already paid. Triggering auto-refund.`);
    try {
      await razorpay.payments.refund(razorpay_payment_id, {
        amount: payment.amount * 100,
        notes: { reason: "Duplicate payment detected" },
      });
    } catch (e) {
      console.error("Failed to refund duplicate payment:", e.message);
    }
    throw new Error("Duplicate payment detected. A refund has been automatically initiated.");
  }

  // ── Signature verification ────────────────────────────────────
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new Error("Invalid payment signature");
  }

  // ── Save payment as PAID first (outside transaction) ─────────
  // This ensures the paid record persists even if booking creation fails
  payment.status = "paid";
  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.paidAt = new Date();
  await payment.save();

  // ── Try booking creation ──────────────────────────────────────
  try {
    const { booking, service } = await createBookingInternal(
      {
        salonId: payment.salon,
        serviceId: payment.service,
        bookingDate: payment.metadata.bookingDate,
        startTime: payment.metadata.startTime,
        notes: payment.metadata.notes,
      },
      payment.customer
    );

    payment.booking = booking._id;
    await payment.save();

    await createNotificationService(
      payment.customer,
      "Payment Successful",
      `Your payment for ${service.name} was successful. Awaiting salon confirmation.`,
      "payment"
    );

    return { payment, booking };
  } catch (bookingError) {
    console.error("[AUTO-REFUND] Booking creation failed after payment:", bookingError.message);

    // ── Auto-refund: booking creation failure ─────────────────
    try {
      const refund = await razorpay.payments.refund(razorpay_payment_id, {
        amount: payment.amount * 100,
        notes: { reason: "Booking creation failed: " + bookingError.message },
      });

      payment.status = "refunded";
      payment.refundId = refund.id;
      payment.refundAmount = payment.amount;
      payment.refundStatus = "processed";
      payment.refundReason = `Auto-refund: Booking failed — ${bookingError.message}`;
      await payment.save();

      await createNotificationService(
        payment.customer,
        "Refund Initiated",
        `Your payment slot was unavailable. A full refund of ₹${payment.amount} has been initiated.`,
        "payment"
      );
    } catch (refundError) {
      console.error("[AUTO-REFUND FAILED]:", refundError.message);
      payment.refundStatus = "failed";
      payment.refundReason = `Auto-refund failed after booking failure: ${refundError.message}`;
      await payment.save();
    }

    throw new Error(
      `Payment was successful, but the booking slot was no longer available. A full refund has been automatically initiated. (${bookingError.message})`
    );
  }
};

/* ─── Process Razorpay Webhooks ─────────────────────────────────── */

const processWebhookService = async (payload, signature) => {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new Error("Invalid webhook signature");
  }

  const event = payload.event;

  // ── payment.captured ────────────────────────────────────────
  if (event === "payment.captured") {
    const razorpayPaymentId = payload.payload.payment.entity.id;
    const razorpayOrderId = payload.payload.payment.entity.order_id;

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment || payment.webhookProcessed) return;

    // Duplicate: already paid via checkout — refund via webhook
    if (payment.status === "paid") {
      console.warn(`[WEBHOOK DUPLICATE] ${razorpayOrderId} already processed. Refunding.`);
      try {
        await razorpay.payments.refund(razorpayPaymentId, {
          amount: payment.amount * 100,
          notes: { reason: "Duplicate payment via webhook" },
        });
      } catch (e) {
        console.error("Webhook duplicate refund failed:", e.message);
      }
      payment.webhookProcessed = true;
      await payment.save();
      return;
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.webhookProcessed = true;
    payment.paidAt = new Date();
    await payment.save();
  }

  // ── payment.failed ───────────────────────────────────────────
  if (event === "payment.failed") {
    const razorpayOrderId = payload.payload.payment.entity.order_id;
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) return;
    payment.status = "failed";
    await payment.save();
  }

  // ── refund.processed / payment.refunded (gateway reversal) ──
  if (event === "refund.processed" || event === "payment.refunded") {
    const razorpayPaymentId = payload.payload.payment?.entity?.id
      || payload.payload.refund?.entity?.payment_id;

    if (!razorpayPaymentId) return;

    const payment = await Payment.findOne({ razorpayPaymentId });
    if (!payment) return;

    payment.status = "refunded";
    payment.refundStatus = "processed";
    payment.refundReason = payment.refundReason || "Gateway-initiated refund/reversal";
    await payment.save();

    // Sync: cancel associated booking
    if (payment.booking) {
      const booking = await Booking.findById(payment.booking);
      if (
        booking &&
        booking.status !== "cancelled_by_customer" &&
        booking.status !== "cancelled_by_owner"
      ) {
        booking.status = "cancelled_by_owner";
        booking.cancelledReason = "Payment reversed by gateway";
        await booking.save();
      }
    }
  }
};

/* ─── Direct Refund (Admin/Owner manual) ────────────────────────── */

const refundPaymentService = async (paymentId, refundReason = "", requestingUser) => {
  const payment = await Payment.findById(paymentId).populate("salon", "owner");
  if (!payment) throw new Error("Payment not found");

  if (requestingUser && requestingUser.role === "salon_owner") {
    const salonOwnerId = payment.salon?.owner?.toString();
    if (salonOwnerId !== requestingUser._id.toString()) {
      throw new Error("Not authorized to refund this payment");
    }
  }

  if (payment.status !== "paid") throw new Error("Only paid payments can be refunded");
  if (!payment.razorpayPaymentId) throw new Error("Razorpay payment id not found");

  const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
    amount: payment.amount * 100,
  });

  payment.status = "refunded";
  payment.refundId = refund.id;
  payment.refundAmount = payment.amount;
  payment.refundStatus = "processed";
  payment.refundReason = refundReason || "Manual refund by admin/owner";
  await payment.save();

  let booking = null;
  if (payment.booking) {
    booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.status = "cancelled_by_owner";
      booking.cancelledReason = refundReason || "Refund processed";
      await booking.save();
    }
  }

  await createNotificationService(
    payment.customer,
    "Refund Processed",
    `Your refund of ₹${payment.amount} has been processed successfully.`,
    "payment"
  );

  return { payment, refund, booking };
};

/* ─── Admin Refund Request Flow ─────────────────────────────────── */

/**
 * List all customer-initiated refund requests pending admin review.
 */
const getRefundRequestsService = async () => {
  return await Payment.find({ refundStatus: "pending" })
    .populate("customer", "name email phone")
    .populate("salon", "name city")
    .populate("service", "name price")
    .populate("booking", "bookingDate startTime status cancelledReason")
    .sort({ updatedAt: -1 });
};

/**
 * Admin approves a customer refund request — triggers Razorpay refund.
 */
const approveRefundRequestService = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error("Payment not found");
  if (payment.refundStatus !== "pending") {
    throw new Error("This refund request is not pending");
  }
  if (payment.status !== "paid") throw new Error("Only paid payments can be refunded");
  if (!payment.razorpayPaymentId) throw new Error("Razorpay payment ID not found");

  try {
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: payment.amount * 100,
      notes: { reason: payment.refundReason || "Admin approved customer refund" },
    });

    payment.status = "refunded";
    payment.refundId = refund.id;
    payment.refundAmount = payment.amount;
    payment.refundStatus = "processed";
    await payment.save();

    await createNotificationService(
      payment.customer,
      "Refund Approved",
      `Your refund of ₹${payment.amount} has been approved and processed. It will reflect in 5-7 business days.`,
      "payment"
    );

    return { payment, refund };
  } catch (err) {
    console.error("Razorpay refund API call failed:", err);
    payment.refundStatus = "failed";
    payment.refundReason = `Refund failed: ${err.message || "Unknown error"}`;
    await payment.save();
    throw new Error(`Razorpay Refund failed: ${err.message || "Check API keys or payment ID existence."}`);
  }
};

/**
 * Admin rejects a customer refund request.
 */
const rejectRefundRequestService = async (paymentId, rejectionNote = "") => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error("Payment not found");
  if (payment.refundStatus !== "pending") {
    throw new Error("This refund request is not pending");
  }

  payment.refundStatus = "failed";
  payment.refundReason = payment.refundReason
    ? `${payment.refundReason} | Admin rejected: ${rejectionNote}`
    : `Admin rejected: ${rejectionNote}`;
  await payment.save();

  await createNotificationService(
    payment.customer,
    "Refund Request Declined",
    `Your refund request was reviewed and declined by admin. Reason: ${rejectionNote || "No reason provided."}`,
    "payment"
  );

  return { payment };
};

/* ─── Auto-cleanup: Expired Pending Bookings ────────────────────── */

/**
 * Called periodically (or on demand). Finds bookings in "pending" status
 * that have exceeded PENDING_ACCEPTANCE_TIMEOUT_MINUTES and auto-refunds them.
 */
const checkExpiredPendingBookingsService = async () => {
  const cutoff = new Date(
    Date.now() - PENDING_ACCEPTANCE_TIMEOUT_MINUTES * 60 * 1000
  );

  const expiredBookings = await Booking.find({
    status: "pending",
    createdAt: { $lt: cutoff },
  });

  const results = [];

  for (const booking of expiredBookings) {
    try {
      booking.status = "cancelled_by_owner";
      booking.cancelledReason = `Auto-cancelled: Salon did not accept within ${PENDING_ACCEPTANCE_TIMEOUT_MINUTES} minutes`;
      await booking.save();

      const payment = await Payment.findOne({
        booking: booking._id,
        status: "paid",
        refundStatus: "not_requested",
      });

      if (payment && payment.razorpayPaymentId) {
        const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: payment.amount * 100,
          notes: { reason: "Auto-refund: booking acceptance timeout" },
        });

        payment.status = "refunded";
        payment.refundId = refund.id;
        payment.refundAmount = payment.amount;
        payment.refundStatus = "processed";
        payment.refundReason = `Auto-refund: Salon did not accept within ${PENDING_ACCEPTANCE_TIMEOUT_MINUTES} minutes`;
        await payment.save();

        await createNotificationService(
          booking.customer,
          "Booking Auto-Cancelled",
          `The salon didn't respond to your booking in time. A full refund of ₹${payment.amount} has been initiated.`,
          "payment"
        );
      }

      results.push({ bookingId: booking._id, status: "auto-cancelled-and-refunded" });
    } catch (err) {
      console.error(`Failed to auto-cancel booking ${booking._id}:`, err.message);
      results.push({ bookingId: booking._id, status: "error", error: err.message });
    }
  }

  return results;
};

/**
 * Called periodically. Finds payments in "paid" status with no booking attached
 * after PAYMENT_TIMEOUT_MINUTES and triggers auto-refund.
 * This handles "System timeout after successful payment".
 */
const checkPaymentTimeoutsService = async () => {
  const cutoff = new Date(
    Date.now() - PAYMENT_TIMEOUT_MINUTES * 60 * 1000
  );

  const orphanedPayments = await Payment.find({
    status: "paid",
    booking: { $exists: false },
    paidAt: { $lt: cutoff },
    refundStatus: "not_requested",
  });

  const results = [];

  for (const payment of orphanedPayments) {
    try {
      if (!payment.razorpayPaymentId) continue;

      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: payment.amount * 100,
        notes: { reason: "System timeout: payment with no booking created" },
      });

      payment.status = "refunded";
      payment.refundId = refund.id;
      payment.refundAmount = payment.amount;
      payment.refundStatus = "processed";
      payment.refundReason = "Auto-refund: System timeout — booking was never created after payment";
      await payment.save();

      await createNotificationService(
        payment.customer,
        "Refund Initiated — System Timeout",
        `We noticed your payment was completed but the booking was not created. A full refund of ₹${payment.amount} has been initiated.`,
        "payment"
      );

      results.push({ paymentId: payment._id, status: "timeout-refunded" });
    } catch (err) {
      console.error(`Payment timeout refund failed for ${payment._id}:`, err.message);
      results.push({ paymentId: payment._id, status: "error", error: err.message });
    }
  }

  return results;
};

/* ─── Revenue & Analytics ───────────────────────────────────────── */

const getMyPaymentsService = async (customerId) => {
  return await Payment.find({ customer: customerId })
    .populate("salon", "name city")
    .populate("service", "name price")
    .populate("booking", "bookingDate startTime status")
    .sort({ createdAt: -1 });
};

const getSalonPaymentsService = async (salonId) => {
  return await Payment.find({ salon: salonId })
    .populate("customer", "name email")
    .populate("service", "name price")
    .populate("booking", "bookingDate startTime status")
    .sort({ createdAt: -1 });
};

const getAllPaymentsService = async () => {
  return await Payment.find()
    .populate("customer", "name email")
    .populate("salon", "name city")
    .populate("service", "name")
    .sort({ createdAt: -1 });
};

const getTotalRevenueService = async () => {
  const result = await Payment.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);
  return result[0]?.totalRevenue || 0;
};

const getTodayRevenueService = async () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const result = await Payment.aggregate([
    { $match: { status: "paid", paidAt: { $gte: start, $lte: end } } },
    { $group: { _id: null, revenue: { $sum: "$amount" } } },
  ]);
  return result[0]?.revenue || 0;
};

const getMonthlyRevenueService = async () => {
  const currentYear = new Date().getFullYear();
  return await Payment.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: { month: { $month: "$paidAt" }, year: { $year: "$paidAt" } },
        revenue: { $sum: "$amount" },
      },
    },
    { $match: { "_id.year": currentYear } },
    { $sort: { "_id.month": 1 } },
  ]);
};

const getRefundedAmountService = async () => {
  const result = await Payment.aggregate([
    { $match: { status: "refunded" } },
    { $group: { _id: null, refundedAmount: { $sum: "$refundAmount" } } },
  ]);
  return result[0]?.refundedAmount || 0;
};

const getNetRevenueService = async () => {
  const [paidResult, refundedResult] = await Promise.all([
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "refunded" } },
      { $group: { _id: null, total: { $sum: "$refundAmount" } } },
    ]),
  ]);
  const paidAmount = paidResult[0]?.total || 0;
  const refundedAmount = refundedResult[0]?.total || 0;
  return { paidRevenue: paidAmount, refundedRevenue: refundedAmount, netRevenue: paidAmount - refundedAmount };
};

module.exports = {
  createOrderService,
  verifyPaymentService,
  processWebhookService,
  refundPaymentService,
  getRefundRequestsService,
  approveRefundRequestService,
  rejectRefundRequestService,
  checkExpiredPendingBookingsService,
  checkPaymentTimeoutsService,
  getMyPaymentsService,
  getSalonPaymentsService,
  getAllPaymentsService,
  getTotalRevenueService,
  getTodayRevenueService,
  getMonthlyRevenueService,
  getRefundedAmountService,
  getNetRevenueService,
};