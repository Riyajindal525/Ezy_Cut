const Payment = require(
  "../models/payment.model"
);

const Salon = require(
  "../models/salon.model"
);

const Service = require(
  "../models/service.model"
);
const Booking = require(
  "../models/booking.model"
);

const razorpay = require(
  "../config/razorpay"
);


const crypto = require("crypto");
const mongoose = require("mongoose");

const {
  createBookingInternal,
} = require("./booking.service");

const {
  createNotificationService,
} = require("./notification.service");

const createOrderService =
  async (
    data,
    customerId
  ) => {
    const {
      salonId,
      serviceId,
      bookingDate,
      startTime,
      notes,
    } = data;

    const salon =
      await Salon.findById(
        salonId
      );

    if (!salon) {
      throw new Error(
        "Salon not found"
      );
    }

    if (
      !salon.isApproved
    ) {
      throw new Error(
        "Salon not approved"
      );
    }

    const service =
      await Service.findById(
        serviceId
      );

    if (!service) {
      throw new Error(
        "Service not found"
      );
    }

    const amount =
      service.price * 100;

    const order =
      await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt:
          `receipt_${Date.now()}`,
      });

    const payment =
      await Payment.create({
        customer:
          customerId,

        salon:
          salonId,

        service:
          serviceId,

        amount:
          service.price,

        razorpayOrderId:
          order.id,

        metadata: {
          bookingDate,
          startTime,
          notes,
        },
      });

    return {
      paymentId:
        payment._id,

      orderId:
        order.id,

      amount,

      currency:
        order.currency,

      key:
        process.env
          .RAZORPAY_KEY_ID,
    };
  };

  const verifyPaymentService =
  async (data) => {
    const {
      paymentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = data;

    const payment =
      await Payment.findById(
        paymentId
      );

    if (!payment) {
      throw new Error(
        "Payment not found"
      );
    }

    if (
      payment.status ===
      "paid"
    ) {
      throw new Error(
        "Payment already processed"
      );
    }

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env
            .RAZORPAY_KEY_SECRET
        )
        .update(body)
        .digest("hex");

    if (
      expectedSignature !==
      razorpay_signature
    ) {
      throw new Error(
        "Invalid payment signature"
      );
    }

    const session =
      await mongoose.startSession();

    session.startTransaction();

    try {
      payment.status = "paid";

      payment.razorpayPaymentId =
        razorpay_payment_id;

      payment.razorpaySignature =
        razorpay_signature;

      payment.paidAt =
        new Date();

      await payment.save({
        session,
      });

      const {
        booking,
        service,
      } =
        await createBookingInternal(
          {
            salonId:
              payment.salon,
            serviceId:
              payment.service,
            bookingDate:
              payment.metadata
                .bookingDate,
            startTime:
              payment.metadata
                .startTime,
            notes:
              payment.metadata
                .notes,
          },
          payment.customer,
          session
        );

      payment.booking =
        booking._id;

      await payment.save({
        session,
      });

      

      await createNotificationService(
        payment.customer,
        "Payment Successful",
        `Your payment for ${service.name} was successful.`,
        "payment"
      );

      await session.commitTransaction();

      session.endSession();

      return {
        payment,
        booking,
      };
    } catch (error) {
      await session.abortTransaction();

      session.endSession();

      throw error;
    }
  };

  const processWebhookService =
  async (payload, signature) => {

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env
            .RAZORPAY_WEBHOOK_SECRET
        )
        .update(
          JSON.stringify(payload)
        )
        .digest("hex");

    if (expectedSignature !== signature) {
      throw new Error(
        "Invalid webhook signature"
      );
    }

    const event =
      payload.event;

    if (
      event ===
      "payment.captured"
    ) {

      const razorpayPaymentId =
        payload.payload
          .payment
          .entity.id;

      const razorpayOrderId =
        payload.payload
          .payment
          .entity.order_id;

      const payment =
        await Payment.findOne({
          razorpayOrderId:
            razorpayOrderId,
        });

      if (!payment) {
        return;
      }

      if (
        payment.webhookProcessed
      ) {
        return;
      }

      payment.status =
        "paid";

      payment.razorpayPaymentId =
        razorpayPaymentId;

      payment.webhookProcessed =
        true;

      payment.paidAt =
        new Date();

      await payment.save();
    }

    if (
      event ===
      "payment.failed"
    ) {

      const razorpayOrderId =
        payload.payload
          .payment
          .entity.order_id;

      const payment =
        await Payment.findOne({
          razorpayOrderId:
            razorpayOrderId,
        });

      if (!payment) {
        return;
      }

      payment.status =
        "failed";

      await payment.save();
    }
  };
  
 const refundPaymentService =
  async (
    paymentId,
    refundReason = "",
    requestingUser
  ) => {

    const payment =
      await Payment.findById(
        paymentId
      ).populate("salon", "owner");

    if (!payment) {
      throw new Error(
        "Payment not found"
      );
    }

    // Ownership guard: salon_owner may only refund their own salon's payments
    if (requestingUser && requestingUser.role === "salon_owner") {
      const salonOwnerId = payment.salon?.owner?.toString();
      if (salonOwnerId !== requestingUser._id.toString()) {
        throw new Error(
          "Not authorized to refund this payment"
        );
      }
    }

    if (
      payment.status !==
      "paid"
    ) {
      throw new Error(
        "Only paid payments can be refunded"
      );
    }

    if (
      !payment.razorpayPaymentId
    ) {
      throw new Error(
        "Razorpay payment id not found"
      );
    }

    const refund =
      await razorpay.payments.refund(
        payment.razorpayPaymentId,
        {
          amount:
            payment.amount *
            100,
        }
      );

    payment.status =
      "refunded";

    payment.refundId =
      refund.id;

    payment.refundAmount =
      payment.amount;

    payment.refundStatus =
      "processed";

    payment.refundReason =
      refundReason;

    await payment.save();

    let booking = null;

    if (
      payment.booking
    ) {

      booking =
        await Booking.findById(
          payment.booking
        );

      if (booking) {

        booking.status =
          "cancelled_by_owner";

        booking.cancelledReason =
          refundReason ||
          "Refund processed";

        await booking.save();
      }
    }

    await createNotificationService(
      payment.customer,
      "Refund Processed",
      `Your refund of ₹${payment.amount} has been processed successfully.`,
      "payment"
    );

    return {
      payment,
      refund,
      booking,
    };
  };
  
  const getMyPaymentsService =
  async (customerId) => {

    const payments =
      await Payment.find({
        customer:
          customerId,
      })
        .populate(
          "salon",
          "name city"
        )
        .populate(
          "service",
          "name price"
        )
        .populate(
          "booking",
          "bookingDate startTime status"
        )
        .sort({
          createdAt: -1,
        });

    return payments;
  };

  const getSalonPaymentsService =
  async (salonId) => {

    const payments =
      await Payment.find({
        salon: salonId,
      })
        .populate(
          "customer",
          "name email"
        )
        .populate(
          "service",
          "name price"
        )
        .populate(
          "booking",
          "bookingDate startTime status"
        )
        .sort({
          createdAt: -1,
        });

    return payments;
  };

  const getAllPaymentsService =
  async () => {

    const payments =
      await Payment.find()
        .populate(
          "customer",
          "name email"
        )
        .populate(
          "salon",
          "name city"
        )
        .populate(
          "service",
          "name"
        )
        .sort({
          createdAt: -1,
        });

    return payments;
  };
  
  const getTotalRevenueService =
  async () => {

    const result =
      await Payment.aggregate([
        {
          $match: {
            status: "paid",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$amount",
            },
          },
        },
      ]);

    return (
      result[0]
        ?.totalRevenue || 0
    );
  };

  const getTodayRevenueService =
  async () => {

    const start =
      new Date();

    start.setHours(
      0,
      0,
      0,
      0
    );

    const end =
      new Date();

    end.setHours(
      23,
      59,
      59,
      999
    );

    const result =
      await Payment.aggregate([
        {
          $match: {
            status: "paid",
            paidAt: {
              $gte: start,
              $lte: end,
            },
          },
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: "$amount",
            },
          },
        },
      ]);

    return (
      result[0]
        ?.revenue || 0
    );
  };

  const getMonthlyRevenueService =
  async () => {

    const currentYear =
      new Date()
        .getFullYear();

    const result =
      await Payment.aggregate([
        {
          $match: {
            status: "paid",
          },
        },
        {
          $group: {
            _id: {
              month: {
                $month:
                  "$paidAt",
              },
              year: {
                $year:
                  "$paidAt",
              },
            },
            revenue: {
              $sum:
                "$amount",
            },
          },
        },
        {
          $match: {
            "_id.year":
              currentYear,
          },
        },
        {
          $sort: {
            "_id.month":
              1,
          },
        },
      ]);

    return result;
  };

  const getRefundedAmountService =
  async () => {

    const result =
      await Payment.aggregate([
        {
          $match: {
            status:
              "refunded",
          },
        },
        {
          $group: {
            _id: null,
            refundedAmount: {
              $sum:
                "$refundAmount",
            },
          },
        },
      ]);

    return (
      result[0]
        ?.refundedAmount || 0
    );
  };
  const getNetRevenueService =
  async () => {

    const paid =
      await Payment.aggregate([
        {
          $match: {
            status:
              "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum:
                "$amount",
            },
          },
        },
      ]);

    const refunded =
      await Payment.aggregate([
        {
          $match: {
            status:
              "refunded",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum:
                "$refundAmount",
            },
          },
        },
      ]);

    const paidAmount =
      paid[0]?.total || 0;

    const refundedAmount =
      refunded[0]?.total || 0;

    return {
      paidRevenue:
        paidAmount,
      refundedRevenue:
        refundedAmount,
      netRevenue:
        paidAmount -
        refundedAmount,
    };
  };

module.exports = {
  createOrderService,
  verifyPaymentService,
  processWebhookService,
  refundPaymentService,
  getMyPaymentsService,
  getSalonPaymentsService,
  getAllPaymentsService,
  getTotalRevenueService,
  getTodayRevenueService,
  getMonthlyRevenueService,
  getRefundedAmountService,
  getNetRevenueService
};