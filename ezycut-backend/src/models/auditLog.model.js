const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetWallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletAccount",
      required: true,
    },
    targetCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
    },
    reason: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ targetCustomer: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
