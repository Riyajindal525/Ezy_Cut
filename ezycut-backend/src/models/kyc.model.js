const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema(
  {
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
      unique: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Owner Identity Proof (Aadhaar / PAN / Voter ID / Passport)
    ownerIdProof: {
      type: String,
      required: true,
    },

    ownerIdProofType: {
      type: String,
      enum: ["aadhaar", "pan", "voter_id", "passport", "driving_license"],
      required: true,
    },

    // Business Proof (GST / Trade License / Shop Act)
    businessProof: {
      type: String, // Cloudinary URL
      default: "",
    },

    businessProofType: {
      type: String,
      enum: ["gst", "trade_license", "shop_act", "udyam", "other", "none"],
      default: "none",
    },

    // Salon Images (JPEG/PNG only, uploaded via Cloudinary)
    salonImages: [
      {
        type: String,
      },
    ],

    // KYC Review Status
    kycStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("KYC", kycSchema);
