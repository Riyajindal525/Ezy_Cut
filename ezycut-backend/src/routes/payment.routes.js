const express =
  require("express");

const router =
  express.Router();

const protect =
  require(
    "../middleware/auth.middleware"
  );

const authorizeRoles =
  require(
    "../middleware/role.middleware"
  );

const {
  createOrder,
  verifyPayment,
   webhook,
   refundPayment,
    getMyPayments,
  getSalonPayments,
  getAllPayments,
  getTotalRevenue,
  getTodayRevenue,
  getMonthlyRevenue,
  getRefundedAmount,
  getNetRevenue

} = require(
  "../controllers/payment.controller"
);

router.post(
  "/create-order",
  protect,
  authorizeRoles(
    "customer",
    "admin"
  ),
  createOrder
);

router.post(
  "/verify",
  protect,
  authorizeRoles(
    "customer",
    "admin"
  ),
  verifyPayment
);

router.post(
  "/webhook",
  webhook
);

router.post(
  "/refund/:paymentId",
  protect,
  authorizeRoles(
    "admin",
    "salon_owner"
  ),
  refundPayment
);

router.get(
  "/my-payments",
  protect,
  authorizeRoles(
    "customer"
  ),
  getMyPayments
);

router.get(
  "/salon/:salonId",
  protect,
  authorizeRoles(
    "salon_owner",
    "admin"
  ),
  getSalonPayments
);

router.get(
  "/admin/all",
  protect,
  authorizeRoles(
    "admin"
  ),
  getAllPayments
);

router.get(
  "/analytics/total-revenue",
  protect,
  authorizeRoles(
    "admin"
  ),
  getTotalRevenue
);
router.get(
  "/analytics/today-revenue",
  protect,
  authorizeRoles(
    "admin"
  ),
  getTodayRevenue
);

router.get(
  "/analytics/monthly-revenue",
  protect,
  authorizeRoles(
    "admin"
  ),
  getMonthlyRevenue
);

router.get(
  "/analytics/refunded-amount",
  protect,
  authorizeRoles(
    "admin"
  ),
  getRefundedAmount
);
router.get(
  "/analytics/net-revenue",
  protect,
  authorizeRoles(
    "admin"
  ),
  getNetRevenue
);

module.exports = router;