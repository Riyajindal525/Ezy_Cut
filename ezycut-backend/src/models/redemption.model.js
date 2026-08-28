const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletAccount",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pointsRedeemed: {
      type: Number,
      required: true,
      min: 1,
    },
    rewardType: {
      type: String,
      default: "discount_voucher",
    },
    referenceCode: {
      type: String,
      required: true,
      unique: true,
    },
    tier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RewardTier",
      default: null,
    },
    discountAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    minimumBookingAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["issued", "reserved", "used", "expired", "reversed"],
      default: "issued",
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    reservedAt: {
      type: Date,
      default: null,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    usedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

redemptionSchema.index({ customer: 1 });

module.exports = mongoose.model("Redemption", redemptionSchema);
