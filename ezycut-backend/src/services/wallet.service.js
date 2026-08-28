const WalletAccount = require("../models/wallet.model");
const LedgerEntry = require("../models/ledger.model");

/**
 * Atomic find-or-create helper for a customer's wallet.
 */
const ensureWallet = async (customerId) => {
  let wallet = await WalletAccount.findOne({ customer: customerId });
  if (!wallet) {
    try {
      wallet = await WalletAccount.create({ customer: customerId });
    } catch (err) {
      // Handle potential race condition on concurrent creation
      wallet = await WalletAccount.findOne({ customer: customerId });
      if (!wallet) throw err;
    }
  }
  return wallet;
};

/**
 * Retrieve current balance for a customer.
 */
const getBalance = async (customerId) => {
  return await ensureWallet(customerId);
};

/**
 * Paginated ledger entries.
 */
const getLedger = async (customerId, page = 1, limit = 20) => {
  const wallet = await ensureWallet(customerId);
  const skip = (page - 1) * limit;

  const entries = await LedgerEntry.find({ wallet: wallet._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("createdBy", "name email");

  const total = await LedgerEntry.countDocuments({ wallet: wallet._id });

  return {
    entries,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Atomic Credit Points.
 */
const creditPoints = async ({
  customerId,
  points,
  eventType,
  referenceId,
  referenceType,
  idempotencyKey,
  notes,
  createdBy = null,
  expiryMonths = 6,
}) => {
  if (points <= 0) return null;

  const wallet = await ensureWallet(customerId);

  // If idempotencyKey is provided, check if it was already processed
  if (idempotencyKey) {
    const existing = await LedgerEntry.findOne({ idempotencyKey });
    if (existing) {
      console.log(`[Idempotency] Event already processed: ${idempotencyKey}`);
      return existing;
    }
  }

  // Calculate expiry date
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);

  // Update wallet available balance atomically
  const updatedWallet = await WalletAccount.findByIdAndUpdate(
    wallet._id,
    { $inc: { available_balance: points } },
    { new: true }
  );

  // Create ledger entry
  const entry = await LedgerEntry.create({
    wallet: wallet._id,
    eventType,
    direction: "CREDIT",
    points,
    pointsRemaining: points,
    expiryDate,
    referenceId,
    referenceType,
    idempotencyKey,
    balanceAfter: updatedWallet.available_balance,
    notes,
    createdBy,
  });

  return entry;
};

/**
 * Atomic Debit Points (Double-Spend Protected).
 */
const debitPoints = async ({
  customerId,
  points,
  eventType,
  referenceId,
  referenceType,
  idempotencyKey,
  notes,
  createdBy = null,
}) => {
  if (points <= 0) throw new Error("Invalid points amount");

  const wallet = await ensureWallet(customerId);

  if (wallet.status === "frozen") {
    throw new Error("Wallet account is frozen. Transactions are disabled.");
  }

  // If idempotencyKey is provided, check if it was already processed
  if (idempotencyKey) {
    const existing = await LedgerEntry.findOne({ idempotencyKey });
    if (existing) {
      return existing;
    }
  }

  // Double-spend guard: Atomically decrement available balance only if there are enough points
  const updatedWallet = await WalletAccount.findOneAndUpdate(
    { _id: wallet._id, available_balance: { $gte: points }, status: "active" },
    { $inc: { available_balance: -points } },
    { new: true }
  );

  if (!updatedWallet) {
    throw new Error("Insufficient available points balance or wallet is frozen");
  }

  // FIFO consumption logic of older CREDIT entries
  let pointsToDebit = points;
  const activeCredits = await LedgerEntry.find({
    wallet: wallet._id,
    direction: "CREDIT",
    pointsRemaining: { $gt: 0 },
    expiryDate: { $gt: new Date() },
  }).sort({ createdAt: 1 }); // oldest first

  for (const credit of activeCredits) {
    const available = credit.pointsRemaining;
    const toDeduct = Math.min(pointsToDebit, available);

    credit.pointsRemaining -= toDeduct;
    await credit.save();

    pointsToDebit -= toDeduct;
    if (pointsToDebit <= 0) break;
  }

  // Create debit ledger entry
  const entry = await LedgerEntry.create({
    wallet: wallet._id,
    eventType,
    direction: "DEBIT",
    points,
    referenceId,
    referenceType,
    idempotencyKey,
    balanceAfter: updatedWallet.available_balance,
    notes,
    createdBy,
  });

  return entry;
};

/**
 * Background Expiry Job processing.
 * Runs FIFO points removal.
 */
const expirePointsFIFO = async () => {
  const now = new Date();
  
  // Find all active credit entries that have expired but still have remaining points
  const expiredEntries = await LedgerEntry.find({
    direction: "CREDIT",
    pointsRemaining: { $gt: 0 },
    expiryDate: { $lte: now },
  }).populate("wallet");

  let expiredCount = 0;

  for (const entry of expiredEntries) {
    const pointsToExpire = entry.pointsRemaining;
    if (pointsToExpire <= 0) continue;

    const wallet = entry.wallet;
    if (!wallet) continue;

    // Atomically set pointsRemaining to 0 first to prevent concurrent double-expiry
    const updatedEntry = await LedgerEntry.findOneAndUpdate(
      { _id: entry._id, pointsRemaining: pointsToExpire },
      { $set: { pointsRemaining: 0 } },
      { new: true }
    );

    if (!updatedEntry) continue; // Skip if another worker/job updated it

    // Deduct points from wallet account
    const updatedWallet = await WalletAccount.findByIdAndUpdate(
      wallet._id,
      { $inc: { available_balance: -pointsToExpire } },
      { new: true }
    );

    // Create EXPIRED ledger entry (DEBIT)
    await LedgerEntry.create({
      wallet: wallet._id,
      eventType: "EXPIRED",
      direction: "DEBIT",
      points: pointsToExpire,
      referenceId: entry._id.toString(),
      referenceType: "admin_adjustment",
      balanceAfter: updatedWallet ? updatedWallet.available_balance : 0,
      notes: `Points expired from earn transaction: ${entry._id}`,
    });

    // Send a system notification to the user
    try {
      const { createNotificationService } = require("./notification.service");
      await createNotificationService(
        wallet.customer,
        "Points Expired",
        `${pointsToExpire} EZYCUT Points have expired.`,
        "system"
      );
    } catch (notifErr) {
      console.error("Failed to send notification for expired points:", notifErr.message);
    }

    expiredCount++;
  }

  return expiredCount;
};

module.exports = {
  ensureWallet,
  getBalance,
  getLedger,
  creditPoints,
  debitPoints,
  expirePointsFIFO,
};
