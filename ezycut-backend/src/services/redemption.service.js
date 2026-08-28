const Redemption = require("../models/redemption.model");
const RewardTier = require("../models/rewardTier.model");
const walletService = require("./wallet.service");
const crypto = require("crypto");
const { createNotificationService } = require("./notification.service");

/**
 * Validates eligibility, locks points atomically, and issues a redemption code linked to a RewardTier.
 */
const redeemPoints = async (customerId, payload) => {
  let tierId;
  let pointsToRedeem;

  if (typeof payload === "number") {
    pointsToRedeem = payload;
  } else if (payload && typeof payload === "object") {
    tierId = payload.tierId;
    pointsToRedeem = payload.pointsRedeemed;
  }

  let rewardTier = null;
  if (tierId) {
    rewardTier = await RewardTier.findById(tierId);
    if (!rewardTier || !rewardTier.isActive) {
      throw new Error("Selected reward tier is unavailable or inactive");
    }
    pointsToRedeem = rewardTier.pointsRequired;
  } else if (pointsToRedeem) {
    rewardTier = await RewardTier.findOne({ pointsRequired: pointsToRedeem, isActive: true });
  }

  if (!pointsToRedeem || pointsToRedeem <= 0) {
    throw new Error("Invalid points amount to redeem");
  }

  // Ensure wallet exists
  const wallet = await walletService.ensureWallet(customerId);

  if (wallet.status === "frozen") {
    throw new Error("Wallet account is frozen. Redemptions are disabled.");
  }

  if (wallet.available_balance < pointsToRedeem) {
    throw new Error(`Insufficient points balance. You have ${wallet.available_balance} points.`);
  }

  // Determine discount amount & validity days
  const discountAmount = rewardTier ? rewardTier.discountAmount : Math.round(pointsToRedeem / 2);
  const minimumBookingAmount = rewardTier ? rewardTier.minimumBookingAmount : 0;
  const validityDays = rewardTier ? rewardTier.validityDays : 30;
  const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

  // Generate unique redemption reference code (EZY-RDM-XXXXXX-XXXXXX)
  const randomBytes = crypto.randomBytes(3).toString("hex").toUpperCase();
  const referenceCode = `EZY-RDM-${Date.now().toString().slice(-6)}-${randomBytes}`;

  // Idempotency check key
  const idempotencyKey = `redeem:${referenceCode}`;

  // Debit points atomically (guarantees balance check & FIFO consumption)
  await walletService.debitPoints({
    customerId,
    points: pointsToRedeem,
    eventType: "REDEEM",
    referenceId: referenceCode,
    referenceType: "redemption",
    idempotencyKey,
    notes: `Voucher Redemption: ₹${discountAmount} OFF (Code ${referenceCode})`,
  });

  // Create redemption record
  const redemption = await Redemption.create({
    wallet: wallet._id,
    customer: customerId,
    pointsRedeemed: pointsToRedeem,
    rewardType: "discount_voucher",
    referenceCode,
    tier: rewardTier ? rewardTier._id : null,
    discountAmount,
    minimumBookingAmount,
    status: "issued",
    expiresAt,
    issuedAt: new Date(),
  });

  // Send system notification
  await createNotificationService(
    customerId,
    "Reward Voucher Issued! 🎉",
    `₹${discountAmount} OFF voucher created! Code: ${referenceCode}. Valid for ${validityDays} days.`,
    "reward"
  );

  return redemption;
};

/**
 * Validates a customer's reward code for a given booking amount.
 */
const validateRewardCode = async ({ customerId, code, bookingAmount }) => {
  if (!code) throw new Error("Reward code is required");
  const trimmedCode = code.trim().toUpperCase();

  const redemption = await Redemption.findOne({ referenceCode: trimmedCode });

  if (!redemption) {
    throw new Error("Invalid or expired reward code.");
  }

  // Security check: Code must belong to logged-in customer
  if (redemption.customer.toString() !== customerId.toString()) {
    throw new Error("Invalid or expired reward code.");
  }

  // Check if expired
  if (redemption.expiresAt && new Date(redemption.expiresAt) < new Date()) {
    if (redemption.status !== "expired") {
      redemption.status = "expired";
      await redemption.save();
    }
    throw new Error("This reward code has expired.");
  }

  // Check status
  if (redemption.status === "used") {
    throw new Error("This reward has already been used.");
  }

  if (redemption.status === "expired" || redemption.status === "reversed") {
    throw new Error("Invalid or expired reward code.");
  }

  // If reserved by someone else or old reservation
  if (redemption.status === "reserved") {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (redemption.reservedAt && redemption.reservedAt < fifteenMinsAgo) {
      // Release stale reservation
      redemption.status = "issued";
      redemption.reservedAt = null;
      await redemption.save();
    }
  }

  // Minimum booking check
  if (bookingAmount !== undefined && bookingAmount !== null) {
    if (bookingAmount < redemption.minimumBookingAmount) {
      throw new Error(`Booking total must be at least ₹${redemption.minimumBookingAmount} to apply this reward.`);
    }
  }

  return {
    valid: true,
    redemptionId: redemption._id,
    code: redemption.referenceCode,
    discountAmount: redemption.discountAmount,
    minimumBookingAmount: redemption.minimumBookingAmount,
    expiresAt: redemption.expiresAt,
    status: redemption.status,
  };
};

/**
 * Atomically reserves a reward code for an active booking payment attempt.
 */
const reserveRewardCode = async ({ customerId, code, bookingAmount }) => {
  const validation = await validateRewardCode({ customerId, code, bookingAmount });

  // Atomic update to reserved
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
  const updated = await Redemption.findOneAndUpdate(
    {
      _id: validation.redemptionId,
      customer: customerId,
      $or: [
        { status: "issued" },
        { status: "reserved", reservedAt: { $lt: fifteenMinsAgo } },
        { status: "reserved", customer: customerId }, // allow re-reservation by same customer
      ],
    },
    {
      $set: {
        status: "reserved",
        reservedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!updated) {
    throw new Error("Reward code is currently reserved for another payment attempt. Please try again in a few minutes.");
  }

  return updated;
};

/**
 * Reverts a reserved reward code back to ISSUED.
 */
const revertReservation = async (redemptionId) => {
  if (!redemptionId) return;
  await Redemption.findOneAndUpdate(
    { _id: redemptionId, status: "reserved" },
    { $set: { status: "issued", reservedAt: null } }
  );
};

/**
 * Marks a reward code as USED when payment succeeds.
 */
const markRewardUsed = async (redemptionId, bookingId) => {
  if (!redemptionId) return;
  await Redemption.findOneAndUpdate(
    { _id: redemptionId },
    {
      $set: {
        status: "used",
        usedAt: new Date(),
        usedBooking: bookingId,
      },
    }
  );
};

module.exports = {
  redeemPoints,
  validateRewardCode,
  reserveRewardCode,
  revertReservation,
  markRewardUsed,
};
