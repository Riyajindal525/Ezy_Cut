const redemptionService = require("../services/redemption.service");
const walletService = require("../services/wallet.service");
const RewardTier = require("../models/rewardTier.model");
const Redemption = require("../models/redemption.model");

/**
 * Get active reward discount tiers
 */
const getRewardTiers = async (req, res, next) => {
  try {
    const tiers = await RewardTier.find({ isActive: true }).sort({ pointsRequired: 1 });
    return res.status(200).json({
      success: true,
      tiers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate customer reward code for booking
 */
const validateRewardCode = async (req, res, next) => {
  try {
    const { code, bookingAmount } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Reward code is required",
      });
    }

    const validation = await redemptionService.validateRewardCode({
      customerId: req.user._id,
      code,
      bookingAmount,
    });

    return res.status(200).json({
      success: true,
      ...validation,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Invalid or expired reward code.",
    });
  }
};

/**
 * Get customer's issued/used vouchers
 */
const getMyVouchers = async (req, res, next) => {
  try {
    const vouchers = await Redemption.find({ customer: req.user._id })
      .populate("tier")
      .populate("usedBooking", "bookingDate startTime totalAmount")
      .sort({ createdAt: -1 });

    // Auto-update expired vouchers in list
    const now = new Date();
    const formatted = vouchers.map((v) => {
      const isExpired = v.expiresAt && new Date(v.expiresAt) < now && v.status === "issued";
      return {
        _id: v._id,
        referenceCode: v.referenceCode,
        pointsRedeemed: v.pointsRedeemed,
        discountAmount: v.discountAmount,
        minimumBookingAmount: v.minimumBookingAmount,
        status: isExpired ? "expired" : v.status,
        expiresAt: v.expiresAt,
        issuedAt: v.issuedAt,
        usedAt: v.usedAt,
        usedBooking: v.usedBooking,
      };
    });

    return res.status(200).json({
      success: true,
      vouchers: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Redeem customer points for a selected tier
 */
const redeemPoints = async (req, res, next) => {
  try {
    const { points, tierId } = req.body;

    const redemption = await redemptionService.redeemPoints(req.user._id, {
      tierId,
      pointsRedeemed: points,
    });

    return res.status(200).json({
      success: true,
      message: `Voucher generated successfully! ₹${redemption.discountAmount} OFF code: ${redemption.referenceCode}`,
      referenceCode: redemption.referenceCode,
      discountAmount: redemption.discountAmount,
      minimumBookingAmount: redemption.minimumBookingAmount,
      pointsRedeemed: redemption.pointsRedeemed,
      expiresAt: redemption.expiresAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Idempotent earn credit endpoint (system/testing)
 */
const earnPoints = async (req, res, next) => {
  try {
    const { customerId, points, referenceId, referenceType, idempotencyKey, notes } = req.body;
    if (!customerId || !points || points <= 0 || !referenceId || !referenceType || !idempotencyKey) {
      return res.status(400).json({
        success: false,
        message: "Missing required earning parameters",
      });
    }

    const entry = await walletService.creditPoints({
      customerId,
      points,
      eventType: "EARN",
      referenceId,
      referenceType,
      idempotencyKey,
      notes: notes || "Reward credit",
    });

    return res.status(200).json({
      success: true,
      entry,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRewardTiers,
  validateRewardCode,
  getMyVouchers,
  redeemPoints,
  earnPoints,
};
