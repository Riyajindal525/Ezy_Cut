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
  getAdminOverview,
  getRecentSalons,
  getRecentUsers,
  getTopSalons,
  getPlatformRevenue
} = require(
  "../controllers/dashboard.controller"
);

const {
  getOwnerOverview,
  getRecentBookings,
  getTopServices,
  getMonthlyRevenue,
} = require(
  "../controllers/dashboard.controller"
);

router.get(
  "/owner/overview",
  protect,
  authorizeRoles(
    "salon_owner",
    "admin"
  ),
  getOwnerOverview
);

router.get(
  "/owner/recent-bookings",
  protect,
  authorizeRoles(
    "salon_owner",
    "admin"
  ),
  getRecentBookings
);

router.get(
  "/owner/top-services",
  protect,
  authorizeRoles(
    "salon_owner",
    "admin"
  ),
  getTopServices
);

router.get(
  "/owner/monthly-revenue",
  protect,
  authorizeRoles(
    "salon_owner",
    "admin"
  ),
  getMonthlyRevenue
);

router.get(
  "/admin/overview",
  protect,
  authorizeRoles("admin"),
  getAdminOverview
);

router.get(
  "/admin/recent-salons",
  protect,
  authorizeRoles("admin"),
  getRecentSalons
);

router.get(
  "/admin/recent-users",
  protect,
  authorizeRoles("admin"),
  getRecentUsers
);

router.get(
  "/admin/top-salons",
  protect,
  authorizeRoles("admin"),
  getTopSalons
);

router.get(
  "/admin/monthly-revenue",
  protect,
  authorizeRoles("admin"),
  getPlatformRevenue
);

module.exports = router;