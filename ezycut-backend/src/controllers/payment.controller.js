const asyncHandler =
  require(
    "../utils/asyncHandler"
  );

const {
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
} = require(
  "../services/payment.service"
);

const createOrder =
  asyncHandler(async (
    req,
    res
  ) => {
    const order =
      await createOrderService(
        req.body,
        req.user._id
      );

    res.status(201).json({
      success: true,
      order,
    });
  });

  const verifyPayment =
  asyncHandler(async (
    req,
    res
  ) => {
    const result =
      await verifyPaymentService(
        req.body
      );

    res.status(200).json({
      success: true,
      message:
        "Payment verified successfully",
      payment:
        result.payment,
      booking:
        result.booking,
    });
  });
  
const webhook =
  asyncHandler(async (
    req,
    res
  ) => {

    await processWebhookService(
      req.body,
      req.headers[
        "x-razorpay-signature"
      ]
    );

    res.status(200).json({
      success: true,
    });
  });

 const refundPayment =
  asyncHandler(async (
    req,
    res
  ) => {

    const result =
      await refundPaymentService(
        req.params.paymentId,
        req.body?.refundReason || "",
        req.user
      );

    res.status(200).json({
      success: true,
      message:
        "Refund processed successfully",
      payment:
        result.payment,
      refund:
        result.refund,
      booking:
        result.booking,
    });
  }); 

  const getMyPayments =
  asyncHandler(async (
    req,
    res
  ) => {

    const payments =
      await getMyPaymentsService(
        req.user._id
      );

    res.status(200).json({
      success: true,
      count:
        payments.length,
      payments,
    });
  });

  const getSalonPayments =
  asyncHandler(async (
    req,
    res
  ) => {

    const payments =
      await getSalonPaymentsService(
        req.params.salonId
      );

    res.status(200).json({
      success: true,
      count:
        payments.length,
      payments,
    });
  });
const getAllPayments =
  asyncHandler(async (
    req,
    res
  ) => {

    const payments =
      await getAllPaymentsService();

    res.status(200).json({
      success: true,
      count:
        payments.length,
      payments,
    });
  });
  
const getTotalRevenue =
  asyncHandler(async (
    req,
    res
  ) => {

    const totalRevenue =
      await getTotalRevenueService();

    res.status(200).json({
      success: true,
      totalRevenue,
    });
  });

  const getTodayRevenue =
  asyncHandler(async (
    req,
    res
  ) => {

    const revenue =
      await getTodayRevenueService();

    res.status(200).json({
      success: true,
      revenue,
    });
  });

  const getMonthlyRevenue =
  asyncHandler(async (
    req,
    res
  ) => {

    const revenue =
      await getMonthlyRevenueService();

    res.status(200).json({
      success: true,
      revenue,
    });
  });

  const getRefundedAmount =
  asyncHandler(async (
    req,
    res
  ) => {

    const refundedAmount =
      await getRefundedAmountService();

    res.status(200).json({
      success: true,
      refundedAmount,
    });
  });
const getNetRevenue =
  asyncHandler(async (
    req,
    res
  ) => {

    const revenue =
      await getNetRevenueService();

    res.status(200).json({
      success: true,
      revenue,
    });
  });
module.exports = {
  createOrder,
  verifyPayment,
  webhook,
  refundPayment,
  getMyPayments,
  getSalonPayments,
  getAllPayments,
  getTotalRevenue,
  getTodayRevenue,
  getMonthlyRevenue,
  getRefundedAmount,
  getNetRevenue
};