const mongoose = require("mongoose");

const rewardTierSchema = new mongoose.Schema(
  {
    pointsRequired: {
      type: Number,
      required: true,
      min: 1,
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    minimumBookingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maximumDiscount: {
      type: Number,
      default: null,
    },
    validityDays: {
      type: Number,
      default: 30,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helper static to seed default tiers if none exist
rewardTierSchema.statics.seedDefaultTiers = async function () {
  const count = await this.countDocuments();
  if (count === 0) {
    console.log("🌱 Seeding default reward discount tiers...");
    await this.create([
      { pointsRequired: 100, discountAmount: 50, minimumBookingAmount: 0, validityDays: 30, isActive: true },
      { pointsRequired: 250, discountAmount: 150, minimumBookingAmount: 0, validityDays: 30, isActive: true },
      { pointsRequired: 500, discountAmount: 350, minimumBookingAmount: 0, validityDays: 30, isActive: true },
    ]);
    console.log("✅ Default reward discount tiers seeded successfully.");
  }
};

module.exports = mongoose.model("RewardTier", rewardTierSchema);
