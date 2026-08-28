const RewardRule = require("../models/rewardRule.model");
const RewardQueue = require("../models/rewardQueue.model");
const Booking = require("../models/booking.model");
const walletService = require("./wallet.service");
const { createNotificationService } = require("./notification.service");

/**
 * Seed default reward rule on startup if none exists.
 */
const seedDefaultRewardRule = async () => {
  try {
    const count = await RewardRule.countDocuments();
    if (count === 0) {
      await RewardRule.create({
        name: "Default 10% Earning Rule",
        isActive: true,
        minAmount: 0,
        pointsPercentage: 10,
        multiplier: 1.0,
      });
      console.log("🌱 Seeded default EzyCut Points 10% earning rule successfully.");
    }
  } catch (error) {
    console.error("Failed to seed default reward rule:", error.message);
  }
};

/**
 * Core processing logic for a single reward queue entry.
 */
const processRewardQueueEntry = async (queueEntry) => {
  const booking = await Booking.findById(queueEntry.booking)
    .populate("customer")
    .populate("service");

  if (!booking) {
    throw new Error(`Booking ${queueEntry.booking} not found`);
  }

  if (booking.status !== "completed") {
    throw new Error(`Booking ${booking._id} status is not completed (${booking.status})`);
  }

  // Idempotency key for booking rewards
  const idempotencyKey = `earn:booking:${booking._id}`;

  // Find the active reward rule
  const rule = await RewardRule.findOne({ isActive: true });
  if (!rule) {
    throw new Error("No active reward rule configured");
  }

  // Calculate points (10% or configured percentage of totalAmount)
  const earnedPoints = Math.floor((booking.totalAmount * rule.pointsPercentage) / 100 * rule.multiplier);

  if (earnedPoints > 0) {
    // Credit points atomically
    await walletService.creditPoints({
      customerId: booking.customer._id,
      points: earnedPoints,
      eventType: "EARN",
      referenceId: booking._id.toString(),
      referenceType: "booking",
      idempotencyKey,
      notes: `Booking Reward: ${booking.service?.name || "Grooming Service"}`,
    });

    // Send a system notification
    await createNotificationService(
      booking.customer._id,
      "Points Earned",
      `Congratulations! You earned ${earnedPoints} EZYCUT Points.`,
      "reward"
    );
  }

  // Update queue entry
  queueEntry.status = "processed";
  queueEntry.attempts += 1;
  queueEntry.lastError = "";
  await queueEntry.save();

  return earnedPoints;
};

/**
 * Entry hook for booking completion. Saves to outbox queue and processes immediately.
 */
const tryEarnPoints = async (booking) => {
  try {
    // Double-spend/Idempotency check: Make sure we don't even create duplicate queue entries
    let queueEntry = await RewardQueue.findOne({ booking: booking._id });
    if (!queueEntry) {
      queueEntry = await RewardQueue.create({
        booking: booking._id,
        status: "pending",
        attempts: 0,
        nextRunAt: new Date(),
      });
    }

    if (queueEntry.status === "processed") {
      return;
    }

    // Try processing immediately
    await processRewardQueueEntry(queueEntry);
  } catch (error) {
    console.error(`[REWARDS] Earn failed immediately for booking ${booking._id}:`, error.message);
    
    // Save failure status and schedule retry in 5 minutes
    const queueEntry = await RewardQueue.findOne({ booking: booking._id });
    if (queueEntry) {
      queueEntry.status = "failed";
      queueEntry.attempts += 1;
      queueEntry.lastError = error.message;
      
      const retryDelayMinutes = Math.pow(2, queueEntry.attempts) * 2; // exponential backoff: 2min, 4min, 8min...
      const nextRun = new Date();
      nextRun.setMinutes(nextRun.getMinutes() + retryDelayMinutes);
      queueEntry.nextRunAt = nextRun;

      await queueEntry.save();
    }
  }
};

/**
 * Background worker job to retry failed or pending entries in the queue.
 */
const processFailedQueueEntries = async () => {
  const now = new Date();
  const pendingOrFailed = await RewardQueue.find({
    status: { $in: ["pending", "failed"] },
    nextRunAt: { $lte: now },
    attempts: { $lt: 5 },
  });

  let processedCount = 0;

  for (const entry of pendingOrFailed) {
    try {
      await processRewardQueueEntry(entry);
      processedCount++;
    } catch (error) {
      console.error(`[REWARDS RETRY] Processing failed for entry ${entry._id}:`, error.message);
      entry.status = "failed";
      entry.attempts += 1;
      entry.lastError = error.message;

      const retryDelayMinutes = Math.pow(2, entry.attempts) * 2;
      const nextRun = new Date();
      nextRun.setMinutes(nextRun.getMinutes() + retryDelayMinutes);
      entry.nextRunAt = nextRun;

      await entry.save();
    }
  }

  return processedCount;
};

module.exports = {
  seedDefaultRewardRule,
  tryEarnPoints,
  processFailedQueueEntries,
};
