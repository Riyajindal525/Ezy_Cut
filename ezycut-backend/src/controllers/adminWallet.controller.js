const WalletAccount = require("../models/wallet.model");
const LedgerEntry = require("../models/ledger.model");
const RewardRule = require("../models/rewardRule.model");
const Redemption = require("../models/redemption.model");
const AuditLog = require("../models/auditLog.model");
const walletService = require("../services/wallet.service");

/**
 * Get any customer's wallet balance and ledger (Admin only).
 */
const getCustomerWallet = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const wallet = await walletService.ensureWallet(customerId);
    const ledger = await walletService.getLedger(customerId, page, limit);

    return res.status(200).json({
      success: true,
      wallet,
      ledger: ledger.entries,
      pagination: ledger.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually adjust points with mandatory audit trailing (Admin only).
 */
const adjustPoints = async (req, res, next) => {
  try {
    const { customerId, points, direction, reason, reference } = req.body;

    if (!customerId || !points || points <= 0 || !direction || !reason || !reference) {
      return res.status(400).json({
        success: false,
        message: "Missing adjustment parameters: customerId, points, direction, reason, and reference are required.",
      });
    }

    if (direction !== "CREDIT" && direction !== "DEBIT") {
      return res.status(400).json({
        success: false,
        message: "Direction must be either CREDIT or DEBIT.",
      });
    }

    const walletBefore = await walletService.ensureWallet(customerId);
    const beforeBalance = walletBefore.available_balance;
    let entry;

    const idempotencyKey = `admin_adj:${reference}:${Date.now()}`;

    if (direction === "CREDIT") {
      entry = await walletService.creditPoints({
        customerId,
        points,
        eventType: "ADJUSTMENT",
        referenceId: reference,
        referenceType: "admin_adjustment",
        idempotencyKey,
        notes: reason,
        createdBy: req.user._id,
      });
    } else {
      entry = await walletService.debitPoints({
        customerId,
        points,
        eventType: "ADJUSTMENT",
        referenceId: reference,
        referenceType: "admin_adjustment",
        idempotencyKey,
        notes: reason,
        createdBy: req.user._id,
      });
    }

    const walletAfter = await walletService.getBalance(customerId);

    // Log to AuditLog
    await AuditLog.create({
      action: "admin_adjustment",
      performedBy: req.user._id,
      targetWallet: walletAfter._id,
      targetCustomer: customerId,
      before: { available_balance: beforeBalance },
      after: { available_balance: walletAfter.available_balance },
      reason,
      reference,
      ipAddress: req.ip || "",
    });

    return res.status(200).json({
      success: true,
      message: `Successfully adjusted points by ${direction === "CREDIT" ? "+" : "-"}${points}.`,
      wallet: walletAfter,
      entry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Freeze or unfreeze wallet (Admin only).
 */
const freezeWallet = async (req, res, next) => {
  try {
    const { customerId, status, reason } = req.body;

    if (!customerId || !status || !reason) {
      return res.status(400).json({
        success: false,
        message: "customerId, status ('active' or 'frozen'), and reason are required.",
      });
    }

    if (status !== "active" && status !== "frozen") {
      return res.status(400).json({
        success: false,
        message: "Status must be 'active' or 'frozen'.",
      });
    }

    const wallet = await walletService.ensureWallet(customerId);
    const beforeStatus = wallet.status;

    wallet.status = status;
    await wallet.save();

    // Log to AuditLog
    await AuditLog.create({
      action: status === "frozen" ? "wallet_freeze" : "wallet_unfreeze",
      performedBy: req.user._id,
      targetWallet: wallet._id,
      targetCustomer: customerId,
      before: { status: beforeStatus },
      after: { status: wallet.status },
      reason,
      reference: `freeze_${wallet._id}`,
      ipAddress: req.ip || "",
    });

    return res.status(200).json({
      success: true,
      message: `Wallet status successfully updated to ${status}.`,
      wallet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reward rules (Admin only).
 */
const getRules = async (req, res, next) => {
  try {
    const rules = await RewardRule.find();
    return res.status(200).json({
      success: true,
      rules,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create reward rule (Admin only).
 */
const createRule = async (req, res, next) => {
  try {
    const { name, isActive, minAmount, pointsPercentage, multiplier } = req.body;

    if (!name || pointsPercentage === undefined) {
      return res.status(400).json({
        success: false,
        message: "name and pointsPercentage are required.",
      });
    }

    const rule = await RewardRule.create({
      name,
      isActive: isActive !== undefined ? isActive : true,
      minAmount: minAmount || 0,
      pointsPercentage,
      multiplier: multiplier || 1.0,
    });

    return res.status(201).json({
      success: true,
      rule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update reward rule (Admin only).
 */
const updateRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, isActive, minAmount, pointsPercentage, multiplier } = req.body;

    const rule = await RewardRule.findById(id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Reward rule not found.",
      });
    }

    if (name !== undefined) rule.name = name;
    if (isActive !== undefined) rule.isActive = isActive;
    if (minAmount !== undefined) rule.minAmount = minAmount;
    if (pointsPercentage !== undefined) rule.pointsPercentage = pointsPercentage;
    if (multiplier !== undefined) rule.multiplier = multiplier;

    await rule.save();

    return res.status(200).json({
      success: true,
      rule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Daily points reconciliation information (Admin only).
 */
const getReconciliation = async (req, res, next) => {
  try {
    // 1. Total available points sum in WalletAccounts
    const wallets = await WalletAccount.find({});
    const totalWalletBalance = wallets.reduce((acc, curr) => acc + curr.available_balance, 0);

    // 2. Sum of CREDITS vs DEBITS from LedgerEntries
    const credits = await LedgerEntry.aggregate([
      { $match: { direction: "CREDIT" } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);
    const debits = await LedgerEntry.aggregate([
      { $match: { direction: "DEBIT" } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);

    const totalCredits = credits[0]?.total || 0;
    const totalDebits = debits[0]?.total || 0;
    const netLedgerBalance = totalCredits - totalDebits;

    const reconciled = totalWalletBalance === netLedgerBalance;

    return res.status(200).json({
      success: true,
      reconciliation: {
        totalWalletBalance,
        netLedgerBalance,
        totalCredits,
        totalDebits,
        reconciled,
        discrepancy: totalWalletBalance - netLedgerBalance,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const RewardTier = require("../models/rewardTier.model");

/**
 * Get all reward tiers (Admin only)
 */
const getRewardTiersAdmin = async (req, res, next) => {
  try {
    const tiers = await RewardTier.find().sort({ pointsRequired: 1 });
    return res.status(200).json({
      success: true,
      tiers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create reward tier (Admin only)
 */
const createRewardTierAdmin = async (req, res, next) => {
  try {
    const { pointsRequired, discountAmount, minimumBookingAmount, validityDays, isActive } = req.body;
    if (!pointsRequired || !discountAmount) {
      return res.status(400).json({
        success: false,
        message: "pointsRequired and discountAmount are required.",
      });
    }

    const tier = await RewardTier.create({
      pointsRequired,
      discountAmount,
      minimumBookingAmount: minimumBookingAmount || 0,
      validityDays: validityDays || 30,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      tier,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update reward tier (Admin only)
 */
const updateRewardTierAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pointsRequired, discountAmount, minimumBookingAmount, validityDays, isActive } = req.body;

    const tier = await RewardTier.findById(id);
    if (!tier) {
      return res.status(404).json({
        success: false,
        message: "Reward tier not found.",
      });
    }

    if (pointsRequired !== undefined) tier.pointsRequired = pointsRequired;
    if (discountAmount !== undefined) tier.discountAmount = discountAmount;
    if (minimumBookingAmount !== undefined) tier.minimumBookingAmount = minimumBookingAmount;
    if (validityDays !== undefined) tier.validityDays = validityDays;
    if (isActive !== undefined) tier.isActive = isActive;

    await tier.save();

    return res.status(200).json({
      success: true,
      tier,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all redemptions (Admin only).
 */
const getRedemptions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const redemptions = await Redemption.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", "name email phone")
      .populate("tier")
      .populate("usedBooking", "bookingDate startTime totalAmount");

    const total = await Redemption.countDocuments();

    return res.status(200).json({
      success: true,
      redemptions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
