const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const {
  getCustomerWallet,
  adjustPoints,
  freezeWallet,
  getRules,
  createRule,
  updateRule,
  getReconciliation,
  getRedemptions,
  getRewardTiersAdmin,
  createRewardTierAdmin,
  updateRewardTierAdmin,
} = require("../controllers/adminWallet.controller");

// All admin wallet routes require login and admin role
router.use(protect, authorizeRoles("admin"));

router.get("/customer/:customerId", getCustomerWallet);
router.post("/adjustment", adjustPoints);
router.post("/freeze", freezeWallet);
router.get("/reconciliation", getReconciliation);
router.get("/redemptions", getRedemptions);

router.get("/rules", getRules);
router.post("/rules", createRule);
router.put("/rules/:id", updateRule);

router.get("/reward-tiers", getRewardTiersAdmin);
router.post("/reward-tiers", createRewardTierAdmin);
router.put("/reward-tiers/:id", updateRewardTierAdmin);

module.exports = router;
