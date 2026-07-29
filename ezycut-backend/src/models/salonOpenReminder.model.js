const mongoose = require("mongoose");

const salonOpenReminderSchema = new mongoose.Schema(
  {
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reminder requests from the same customer for the same salon
salonOpenReminderSchema.index({ salon: 1, customer: 1 }, { unique: true });

module.exports = mongoose.model("SalonOpenReminder", salonOpenReminderSchema);