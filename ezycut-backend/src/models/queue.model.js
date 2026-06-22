const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
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

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    tokenNumber: {
      type: Number,
      required: true,
    },
    
    tokenCode: {
  type: String,
  required: true,
  unique: true,
},

    position: {
      type: Number,
      required: true,
    },

    estimatedWaitTime: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "waiting",
        "in_service",
        "completed",
        "cancelled",
      ],
      default: "waiting",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Queue",
  queueSchema
);