const mongoose = require(
  "mongoose"
);

const paymentSchema =
  new mongoose.Schema(
    {
      customer: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      salon: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Salon",
        required: true,
      },

      service: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },

      booking: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },

      amount: {
        type: Number,
        required: true,
      },

      currency: {
        type: String,
        default: "INR",
      },

      razorpayOrderId: {
        type: String,
        unique: true,
        sparse: true,
      },

      razorpayPaymentId: {
        type: String,
        default: "",
      },

      razorpaySignature: {
        type: String,
        default: "",
      },

      status: {
        type: String,
        enum: [
          "created",
          "authorized",
          "paid",
          "failed",
          "partially_refunded",
          "refunded",
        ],
        default: "created",
      },

      metadata: {
        bookingDate: Date,
        startTime: String,
        notes: String,
      },

      refundId: {
        type: String,
        default: "",
      },

      refundAmount: {
        type: Number,
        default: 0,
      },

      refundStatus: {
        type: String,
        enum: [
          "not_requested",
          "pending",
          "processed",
          "failed",
        ],
        default: "not_requested",
      },
      refundReason: {
  type: String,
  default: "",
},

      webhookProcessed: {
        type: Boolean,
        default: false,
      },

      paymentSource: {
        type: String,
        enum: [
          "checkout",
          "webhook",
        ],
        default: "checkout",
      },

      failureReason: {
        type: String,
        default: "",
      },

      paidAt: {
        type: Date,
      },

    
    },
    {
      timestamps: true,
    }
  );

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

paymentSchema.index({
  customer: 1,
});

paymentSchema.index({
  salon: 1,
});

paymentSchema.index({
  booking: 1,
});



paymentSchema.index({
  razorpayPaymentId: 1,
});

module.exports =
  mongoose.model(
    "Payment",
    paymentSchema
  );