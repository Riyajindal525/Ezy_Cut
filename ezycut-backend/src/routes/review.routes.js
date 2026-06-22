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
  validateReview,
} = require(
  "../validations/review.validation"
);

const {
  createReview,
    getSalonReviews,
    getMyReviews,
} = require(
  "../controllers/review.controller"
);

router.post(
  "/",
  protect,
  authorizeRoles(
    "customer",
    "admin"
  ),
  validateReview,
  createReview
);

router.get(
  "/salon/:salonId",
  getSalonReviews
);

router.get(
  "/my-reviews",
  protect,
  authorizeRoles(
    "customer",
    "admin"
  ),
  getMyReviews
);

module.exports = router;