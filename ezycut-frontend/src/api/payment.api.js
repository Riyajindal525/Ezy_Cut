import api from "./axios";

export const createOrder =
  async (data) => {
    const response =
      await api.post(
        "/payments/create-order",
        data
      );

    return response.data;
  };

export const verifyPayment =
  async (data) => {
    const response =
      await api.post(
        "/payments/verify",
        data
      );

    return response.data;
  };

   export const getMyPayments =
  async () => {
    const response =
      await api.get(
        "/payments/my-payments"
      );

    return response.data;
  };

export const getSalonPayments = async (salonId) => {
  const response = await api.get(`/payments/salon/${salonId}`);
  return response.data;
};

export const refundPayment = async (paymentId, refundReason) => {
  const response = await api.post(`/payments/refund/${paymentId}`, { refundReason });
  return response.data;
};

export const getAllPayments = async () => {
  const response = await api.get("/payments/admin/all");
  return response.data;
};

export const getNetRevenue = async () => {
  const response = await api.get("/payments/analytics/net-revenue");
  return response.data;
};

export const getPlatformMonthlyRevenue = async () => {
  const response = await api.get("/payments/analytics/monthly-revenue");
  return response.data;
};