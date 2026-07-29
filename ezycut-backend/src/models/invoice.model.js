const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true, // only set once invoice is "raised", not while draft
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

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

    lineItems: {
      type: [lineItemSchema],
      required: true,
      validate: (arr) => arr.length > 0,
    },

    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true },
    gstRate: { type: Number, default: 18 },
    gstAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    // Revenue distribution (Step 7 of workflow doc)
    commissionRate: { type: Number, default: 8 }, // % — configurable later
    commissionAmount: { type: Number, default: 0 },
    gatewayChargeAmount: { type: Number, default: 0 },
    salonSettlementAmount: { type: Number, default: 0 },

    notes: { type: String, default: "" },

    status: {
      type: String,
      enum: ["draft", "raised", "paid", "cancelled"],
      default: "draft",
    },
     amountPaidAtBooking: {
        type: Number,
        default: 0,
      },
      balanceDue: {
        type: Number,
        default: 0,
      },

    qrCodeUrl: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },

    raisedAt: { type: Date },
    
    settlementStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending",
      },
      settlementPaidAt: {
        type: Date,
      },
  },
  { timestamps: true }
);

invoiceSchema.index({ salon: 1 });
invoiceSchema.index({ customer: 1 });
invoiceSchema.index({ booking: 1 });

module.exports = mongoose.model("Invoice", invoiceSchema);