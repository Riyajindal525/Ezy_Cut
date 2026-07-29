const mongoose = require("mongoose");

const platformSettingsSchema = new mongoose.Schema(
  {
    commissionRate: { type: Number, default: 8 }, // %
    gatewayChargeRate: { type: Number, default: 2 }, // %
    gstRate: { type: Number, default: 18 }, // %
  },
  { timestamps: true }
);

// Singleton pattern — only one settings document should ever exist
platformSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("PlatformSettings", platformSettingsSchema);