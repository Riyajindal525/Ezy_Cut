const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    wallet_type: {
      type: String,
      enum: ["POINTS"],
      default: "POINTS",
    },
    status: {
      type: String,
      enum: ["active", "frozen"],
      default: "active",
    },
    available_balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    pending_balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    blocked_balance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WalletAccount", walletSchema);
