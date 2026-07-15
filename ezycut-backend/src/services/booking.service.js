const Booking = require("../models/booking.model");
const Salon = require("../models/salon.model");
const Service = require("../models/service.model");
const Payment = require("../models/payment.model");
const Queue = require("../models/queue.model");
const generateSlots = require("../utils/slotGenerator");
const { createNotificationService } = require("./notification.service");

/* ─── Helpers ──────────────────────────────────────────────────── */

/**
 * Cancel a queue entry that is linked to a booking (if it exists and is active).
 */
const syncCancelQueue = async (bookingId) => {
  const queue = await Queue.findOne({
    booking: bookingId,
    status: { $in: ["waiting", "in_service"] },
  });

  if (queue) {
    queue.status = "cancelled";
    await queue.save();

    // Recalculate positions for remaining queue entries
    const remaining = await Queue.find({
      salon: queue.salon,
      status: "waiting",
    })
      .populate("service")
      .sort({ tokenNumber: 1 });

    let totalWait = 0;
    for (let i = 0; i < remaining.length; i++) {
      remaining[i].position = i + 1;
      remaining[i].estimatedWaitTime = totalWait;
      totalWait += remaining[i].service?.duration || 0;
      await remaining[i].save();
    }
  }
};

/**
 * Complete a queue entry linked to a booking (if it is in_service).
 */
const syncCompleteQueue = async (bookingId) => {
  const queue = await Queue.findOne({
    booking: bookingId,
    status: "in_service",
  });

  if (queue) {
    queue.status = "completed";
    await queue.save();
  }
};

/* ─── Available Slots ───────────────────────────────────────────── */

const getAvailableSlotsService = async (salonId, serviceId, date) => {
  const salon = await Salon.findById(salonId);
  if (!salon) throw new Error("Salon not found");

  const service = await Service.findById(serviceId);
  if (!service) throw new Error("Service not found");

  const allSlots = generateSlots(
    salon.openingTime,
    salon.closingTime,
    service.duration
  );

  const bookings = await Booking.find({
    salon: salonId,
    bookingDate: new Date(date),
    status: {
      $nin: ["cancelled_by_customer", "cancelled_by_owner"],
    },
  });

  const bookedSlots = bookings.map((b) => b.startTime);
  return allSlots.filter((slot) => !bookedSlots.includes(slot));
};

/* ─── Internal create (used by payment service) ─────────────────── */

const createBookingInternal = async (data, customerId, session = null) => {
  const salon = await Salon.findById(data.salonId);
  if (!salon) throw new Error("Salon not found");

  const service = await Service.findById(data.serviceId);
  if (!service) throw new Error("Service not found");

  const bookingDate = new Date(data.bookingDate);

  const existingBooking = await Booking.findOne({
    salon: salon._id,
    bookingDate,
    startTime: data.startTime,
    status: { $nin: ["cancelled_by_customer", "cancelled_by_owner"] },
  });

  if (existingBooking) throw new Error("Slot already booked");

  const start = new Date(`1970-01-01 ${data.startTime}`);
  start.setMinutes(start.getMinutes() + service.duration);
  const endTime = start.toTimeString().slice(0, 5);

  let booking;

  if (session) {
    const result = await Booking.create(
      [
        {
          customer: customerId,
          salon: salon._id,
          service: service._id,
          bookingDate,
          startTime: data.startTime,
          endTime,
          totalAmount: service.price,
          status: "pending", // ← Starts as pending; owner must accept
          notes: data.notes || "",
        },
      ],
      { session }
    );
    booking = result[0];
  } else {
    booking = await Booking.create({
      customer: customerId,
      salon: salon._id,
      service: service._id,
      bookingDate,
      startTime: data.startTime,
      endTime,
      totalAmount: service.price,
      status: "pending", // ← Starts as pending; owner must accept
      notes: data.notes || "",
    });
  }

  return { booking, service };
};

/* ─── Direct Booking (no payment) ───────────────────────────────── */

const createBookingService = async (data, customerId) => {
  const { booking, service } = await createBookingInternal(data, customerId);

  await createNotificationService(
    customerId,
    "Booking Submitted",
    `Your booking for ${service.name} is awaiting salon confirmation.`,
    "booking"
  );

  return booking;
};

/* ─── Accept Booking (Owner) ────────────────────────────────────── */

const acceptBookingService = async (booking) => {
  if (booking.status === "confirmed") {
    throw new Error("Booking is already confirmed");
  }
  if (booking.status !== "pending") {
    throw new Error("Only pending bookings can be accepted");
  }

  booking.status = "confirmed";
  await booking.save();

  // Notify the customer
  await createNotificationService(
    booking.customer,
    "Booking Confirmed!",
    `Your booking has been accepted by the salon. See you there! 🎉`,
    "booking"
  );

  return booking;
};

/* ─── My Bookings (Customer) ────────────────────────────────────── */

const getMyBookingsService = async (customerId) => {
  return await Booking.find({ customer: customerId })
    .populate("salon", "name address city phone")
    .populate("service", "name price duration")
    .sort({ bookingDate: -1 });
};

/* ─── Cancel Booking (Customer) ─────────────────────────────────── */

const cancelBookingService = async (booking, reason = "") => {
  if (booking.status === "completed") {
    throw new Error("Completed booking cannot be cancelled");
  }
  if (
    booking.status === "cancelled_by_customer" ||
    booking.status === "cancelled_by_owner"
  ) {
    throw new Error("Booking already cancelled");
  }

  booking.status = "cancelled_by_customer";
  booking.cancelledReason = reason || "Cancelled by customer";
  await booking.save();

  // ── Sync: Cancel any associated queue entry ───────────────────
  await syncCancelQueue(booking._id);

  // ── If payment exists and was paid, request admin refund ──────
  const payment = await Payment.findOne({
    booking: booking._id,
    status: "paid",
    refundStatus: "not_requested",
  });

  if (payment) {
    payment.refundStatus = "pending";
    payment.refundReason =
      reason || "Customer requested cancellation and refund";
    await payment.save();

    // Notify customer that refund request was received
    await createNotificationService(
      booking.customer,
      "Refund Requested",
      `Your refund request for ₹${payment.amount} has been submitted and is pending admin review.`,
      "payment"
    );
  }

  return booking;
};

/* ─── Salon Bookings (Owner) ────────────────────────────────────── */

const getSalonBookingsService = async (salonId) => {
  return await Booking.find({ salon: salonId })
    .populate("customer", "name phone")
    .populate("service", "name price duration")
    .sort({ bookingDate: -1 });
};

/* ─── Complete Booking (Owner) ──────────────────────────────────── */

const completeBookingService = async (booking) => {
  if (
    booking.status === "cancelled_by_customer" ||
    booking.status === "cancelled_by_owner"
  ) {
    throw new Error("Cancelled booking cannot be completed");
  }
  if (booking.status === "completed") {
    throw new Error("Booking already completed");
  }

  booking.status = "completed";
  booking.completedAt = new Date();
  await booking.save();

  // ── Sync: Complete any associated in-service queue entry ──────
  await syncCompleteQueue(booking._id);

  return booking;
};

/* ─── Mark No Show (Owner) ──────────────────────────────────────── */

const markNoShowService = async (booking) => {
  if (booking.status === "completed") {
    throw new Error("Completed booking cannot be marked as no-show");
  }
  if (
    booking.status === "cancelled_by_customer" ||
    booking.status === "cancelled_by_owner"
  ) {
    throw new Error("Cancelled booking cannot be marked as no-show");
  }
  if (booking.status === "no_show") {
    throw new Error("Booking already marked as no-show");
  }

  booking.status = "no_show";
  await booking.save();

  // ── Sync: Cancel any associated queue entry ───────────────────
  await syncCancelQueue(booking._id);

  return booking;
};

/* ─── Owner Cancel Booking ───────────────────────────────────────── */

const ownerCancelBookingService = async (booking, reason = "") => {
  if (booking.status === "completed") {
    throw new Error("Completed booking cannot be cancelled");
  }
  if (
    booking.status === "cancelled_by_customer" ||
    booking.status === "cancelled_by_owner"
  ) {
    throw new Error("Booking already cancelled");
  }

  booking.status = "cancelled_by_owner";
  booking.cancelledReason = reason || "Cancelled by salon";
  await booking.save();

  // ── Sync: Cancel any associated queue entry ───────────────────
  await syncCancelQueue(booking._id);

  // ── Auto-refund if payment exists and was paid ────────────────
  const payment = await Payment.findOne({
    booking: booking._id,
    status: "paid",
    refundStatus: "not_requested",
  });

  if (payment) {
    const razorpay = require("../config/razorpay");
    try {
      const refund = await razorpay.payments.refund(
        payment.razorpayPaymentId,
        { amount: payment.amount * 100 }
      );

      payment.status = "refunded";
      payment.refundId = refund.id;
      payment.refundAmount = payment.amount;
      payment.refundStatus = "processed";
      payment.refundReason =
        reason || "Auto-refund: Salon cancelled booking";
      await payment.save();

      await createNotificationService(
        booking.customer,
        "Booking Cancelled — Refund Initiated",
        `The salon cancelled your booking. A refund of ₹${payment.amount} has been automatically initiated.`,
        "payment"
      );
    } catch (refundErr) {
      console.error("Auto-refund failed after owner cancel:", refundErr);
      payment.refundStatus = "failed";
      payment.refundReason =
        "Auto-refund failed after salon cancellation. Contact support.";
      await payment.save();
    }
  }

  return booking;
};

module.exports = {
  getAvailableSlotsService,
  createBookingInternal,
  createBookingService,
  acceptBookingService,
  getMyBookingsService,
  cancelBookingService,
  getSalonBookingsService,
  completeBookingService,
  markNoShowService,
  ownerCancelBookingService,
};