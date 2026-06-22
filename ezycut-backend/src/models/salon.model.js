const mongoose = require("mongoose");

const salonSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    images: [
      {
        type: String,
      },
    ],

    rating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
    
    services: [
   {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
   },
],

    openingTime: {
      type: String,
      default: "09:00 AM",
    },

    closingTime: {
      type: String,
      default: "09:00 PM",
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

salonSchema.index({
  location: "2dsphere",
});

module.exports = mongoose.model(
  "Salon",
  salonSchema
);