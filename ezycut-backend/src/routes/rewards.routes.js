const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const {
  getRewardTiers,
  validateRewardCode,
  getMyVouchers,
  redeemPoints,
  earnPoints,
} = require("../controllers/rewards.controller");

// Public/Customer: Get active reward tiers
router.get("/tiers", protect, getRewardTiers);

// Customer: Validate reward code for booking
router.post("/validate-code", protect, validateRewardCode);

// Customer: Get my issued/used vouchers
router.get("/my-vouchers", protect, getMyVouchers);

// Customer: Redeem points for a reward tier
router.post("/redeem", protect, redeemPoints);

// Admin/System: Idempotent earn credit
router.post("/earn", protect, authorizeRoles("admin"), earnPoints);

module.exports = router;
