const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
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
} = require("../controllers/payment.controller");

/*
|--------------------------------------------------------------------------
| Customer Routes
|--------------------------------------------------------------------------
*/

// POST /api/payments/create-order
router.post(
  "/create-order",
  protect,
  authorizeRoles("customer", "admin"),
  createOrder
);

// POST /api/payments/verify
router.post(
  "/verify",
  protect,
  authorizeRoles("customer", "admin"),
  verifyPayment
);

// GET /api/payments/my-payments
router.get(
  "/my-payments",
  protect,
  authorizeRoles("customer"),
  getMyPayments
);

/*
|--------------------------------------------------------------------------
| Webhook (public — verified by Razorpay signature)
|--------------------------------------------------------------------------
*/

// POST /api/payments/webhook
router.post("/webhook", webhook);

/*
|--------------------------------------------------------------------------
| Salon Owner Routes
|--------------------------------------------------------------------------
*/

// GET /api/payments/salon/:salonId
router.get(
  "/salon/:salonId",
  protect,
  authorizeRoles("salon_owner", "admin"),
  getSalonPayments
);

// POST /api/payments/refund/:paymentId  (owner can refund their own salon's payments)
router.post(
  "/refund/:paymentId",
  protect,
  authorizeRoles("admin", "salon_owner"),
  refundPayment
);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

// GET /api/payments/admin/all
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  getAllPayments
);

// GET /api/payments/refund-requests  ← NEW: List pending customer refund requests
router.get(
  "/refund-requests",
  protect,
  authorizeRoles("admin"),
  getRefundRequests
);

// PATCH /api/payments/refund-requests/:paymentId/approve  ← NEW: Admin approves refund
router.patch(
  "/refund-requests/:paymentId/approve",
  protect,
  authorizeRoles("admin"),
  approveRefundRequest
);

// PATCH /api/payments/refund-requests/:paymentId/reject  ← NEW: Admin rejects refund
router.patch(
  "/refund-requests/:paymentId/reject",
  protect,
  authorizeRoles("admin"),
  rejectRefundRequest
);

// POST /api/payments/admin/cleanup/pending-bookings  ← NEW: Trigger expired booking cleanup
router.post(
  "/admin/cleanup/pending-bookings",
  protect,
  authorizeRoles("admin"),
  checkExpiredPendingBookings
);

// POST /api/payments/admin/cleanup/payment-timeouts  ← NEW: Trigger payment timeout cleanup
router.post(
  "/admin/cleanup/payment-timeouts",
  protect,
  authorizeRoles("admin"),
  checkPaymentTimeouts
);

/*
|--------------------------------------------------------------------------
| Analytics (Admin)
|--------------------------------------------------------------------------
*/

router.get("/analytics/total-revenue", protect, authorizeRoles("admin"), getTotalRevenue);
router.get("/analytics/today-revenue", protect, authorizeRoles("admin"), getTodayRevenue);
router.get("/analytics/monthly-revenue", protect, authorizeRoles("admin"), getMonthlyRevenue);
router.get("/analytics/refunded-amount", protect, authorizeRoles("admin"), getRefundedAmount);
router.get("/analytics/net-revenue", protect, authorizeRoles("admin"), getNetRevenue);

module.exports = router;