const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    bookingDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    rewardRedemption: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Redemption",
      default: null,
    },

    rewardCode: {
      type: String,
      default: null,
    },

    originalAmount: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    finalAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled_by_customer",
        "cancelled_by_owner",
        "no_show",
      ],
      default: "confirmed",
    },

    notes: {
      type: String,
      default: "",
    },

    cancelledReason: {
      type: String,
      default: "",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Booking",
  bookingSchema
);