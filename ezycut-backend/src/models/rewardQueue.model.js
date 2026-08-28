const mongoose = require("mongoose");

const rewardQueueSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
      default: "",
    },
    nextRunAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

rewardQueueSchema.index({ status: 1, nextRunAt: 1 });

module.exports = mongoose.model("RewardQueue", rewardQueueSchema);
