const walletService = require("../services/wallet.service");
const rewardsService = require("../services/rewards.service");

/**
 * Initializes and schedules background jobs for the reward/wallet system.
 */
const startWalletJobs = () => {
  console.log("⏱️ Starting EzyCut Points Background Workers...");

  // 1. Expiry check: Runs every 1 hour (3600000 ms)
  setInterval(async () => {
    try {
      console.log("[JOB] Running expired points scan...");
      const expiredCount = await walletService.expirePointsFIFO();
      if (expiredCount > 0) {
        console.log(`[JOB] Expired points check completed: ${expiredCount} credit entries expired.`);
      }
    } catch (err) {
      console.error("[JOB ERROR] Expired points scan failed:", err.message);
    }
  }, 60 * 60 * 1000);

  // 2. Failed reward queue retry: Runs every 5 minutes (300000 ms)
  setInterval(async () => {
    try {
      const processed = await rewardsService.processFailedQueueEntries();
      if (processed > 0) {
        console.log(`[JOB] Reward Queue Processor retried and processed ${processed} failed reward events.`);
      }
    } catch (err) {
      console.error("[JOB ERROR] Reward Queue Processor failed:", err.message);
    }
  }, 5 * 60 * 1000);
};

module.exports = {
  startWalletJobs,
};
