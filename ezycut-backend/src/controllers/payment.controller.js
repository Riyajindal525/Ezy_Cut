const asyncHandler = require("../utils/asyncHandler");

const {
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
} = require("../services/payment.service");

/* ─── Create Razorpay Order ─────────────────────────────────────── */

const createOrder = asyncHandler(async (req, res) => {
  const order = await createOrderService(req.body, req.user._id);
  res.status(201).json({ success: true, order });
});

/* ─── Verify Payment & Create Booking ───────────────────────────── */

const verifyPayment = asyncHandler(async (req, res) => {
  const result = await verifyPaymentService(req.body);
  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    payment: result.payment,
    booking: result.booking,
  });
});

/* ─── Razorpay Webhook ──────────────────────────────────────────── */

const webhook = asyncHandler(async (req, res) => {
  await processWebhookService(
    req.body,
    req.headers["x-razorpay-signature"]
  );
  res.status(200).json({ success: true });
});

/* ─── Direct Refund (Admin/Owner) ───────────────────────────────── */

const refundPayment = asyncHandler(async (req, res) => {
  const result = await refundPaymentService(
    req.params.paymentId,
    req.body?.refundReason || "",
    req.user
  );
  res.status(200).json({
    success: true,
    message: "Refund processed successfully",
    payment: result.payment,
    refund: result.refund,
    booking: result.booking,
  });
});

/* ─── Admin: Refund Requests ────────────────────────────────────── */

/**
 * GET /api/payments/refund-requests
 * Lists all payments with refundStatus = "pending" (customer cancellations awaiting admin review).
 */
const getRefundRequests = asyncHandler(async (req, res) => {
  const requests = await getRefundRequestsService();
  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

/**
 * PATCH /api/payments/refund-requests/:paymentId/approve
 * Admin approves and triggers Razorpay refund for a pending request.
 */
const approveRefundRequest = asyncHandler(async (req, res) => {
  const result = await approveRefundRequestService(req.params.paymentId);
  res.status(200).json({
    success: true,
    message: "Refund approved and processed successfully",
    payment: result.payment,
    refund: result.refund,
  });
});

/**
 * PATCH /api/payments/refund-requests/:paymentId/reject
 * Admin rejects a pending refund request.
 */
const rejectRefundRequest = asyncHandler(async (req, res) => {
  const result = await rejectRefundRequestService(
    req.params.paymentId,
    req.body?.rejectionNote || ""
  );
  res.status(200).json({
    success: true,
    message: "Refund request rejected",
    payment: result.payment,
  });
});

/* ─── Admin: Auto-cleanup Triggers ─────────────────────────────── */

/**
 * POST /api/payments/admin/cleanup/pending-bookings
 * Scans and auto-refunds expired pending bookings (not accepted by salon in time).
 */
const checkExpiredPendingBookings = asyncHandler(async (req, res) => {
  const results = await checkExpiredPendingBookingsService();
  res.status(200).json({
    success: true,
    message: `Processed ${results.length} expired pending bookings`,
    results,
  });
});

/**
 * POST /api/payments/admin/cleanup/payment-timeouts
 * Scans and auto-refunds paid payments with no booking after the timeout window.
 */
const checkPaymentTimeouts = asyncHandler(async (req, res) => {
  const results = await checkPaymentTimeoutsService();
  res.status(200).json({
    success: true,
    message: `Processed ${results.length} timed-out payments`,
    results,
  });
});

/* ─── My Payments (Customer) ────────────────────────────────────── */

const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await getMyPaymentsService(req.user._id);
  res.status(200).json({ success: true, count: payments.length, payments });
});

/* ─── Salon Payments (Owner) ────────────────────────────────────── */

const getSalonPayments = asyncHandler(async (req, res) => {
  const payments = await getSalonPaymentsService(req.params.salonId);
  res.status(200).json({ success: true, count: payments.length, payments });
});

/* ─── Admin: All Payments ───────────────────────────────────────── */

const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await getAllPaymentsService();
  res.status(200).json({ success: true, count: payments.length, payments });
});

/* ─── Analytics ─────────────────────────────────────────────────── */

const getTotalRevenue = asyncHandler(async (req, res) => {
  const totalRevenue = await getTotalRevenueService();
  res.status(200).json({ success: true, totalRevenue });
});

const getTodayRevenue = asyncHandler(async (req, res) => {
  const revenue = await getTodayRevenueService();
  res.status(200).json({ success: true, revenue });
});

const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const revenue = await getMonthlyRevenueService();
  res.status(200).json({ success: true, revenue });
});

const getRefundedAmount = asyncHandler(async (req, res) => {
  const refundedAmount = await getRefundedAmountService();
  res.status(200).json({ success: true, refundedAmount });
});

const getNetRevenue = asyncHandler(async (req, res) => {
  const revenue = await getNetRevenueService();
  res.status(200).json({ success: true, revenue });
});

module.exports = {
  createOrder,
  verifyPayment,
  webhook,
  refundPayment,
  getRefundRequests,
  approveRefundRequest,
  rejectRefundRequest,
  checkExpiredPendingBookings,
  checkPaymentTimeouts,
  getMyPayments,
  getSalonPayments,
  getAllPayments,
  getTotalRevenue,
  getTodayRevenue,
  getMonthlyRevenue,
  getRefundedAmount,
  getNetRevenue,
};