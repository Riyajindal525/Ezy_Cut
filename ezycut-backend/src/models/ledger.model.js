const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletAccount",
      required: true,
    },
    eventType: {
      type: String,
      enum: ["EARN", "REDEEM", "ADJUSTMENT", "REVERSAL", "EXPIRED"],
      required: true,
    },
    direction: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: 0,
    },
    pointsRemaining: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    referenceId: {
      type: String,
      required: true,
    },
    referenceType: {
      type: String,
      enum: ["booking", "redemption", "admin_adjustment"],
      required: true,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups & FIFO calculations
ledgerSchema.index({ wallet: 1, createdAt: 1 });
ledgerSchema.index({ pointsRemaining: 1, expiryDate: 1 });

module.exports = mongoose.model("LedgerEntry", ledgerSchema);
