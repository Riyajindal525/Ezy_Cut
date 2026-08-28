const mongoose = require("mongoose");

const rewardRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pointsPercentage: {
      type: Number,
      default: 10, // e.g. 10%
      min: 0,
    },
    multiplier: {
      type: Number,
      default: 1.0,
      min: 0.1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RewardRule", rewardRuleSchema);
