import api from "./axios";

export const getWalletBalance = async () => {
  const response = await api.get("/wallet/balance");
  return response.data;
};

export const getLedger = async (page = 1, limit = 20) => {
  const response = await api.get(`/wallet/ledger?page=${page}&limit=${limit}`);
  return response.data;
};

export const getRewardTiers = async () => {
  const response = await api.get("/rewards/tiers");
  return response.data;
};

export const validateRewardCode = async (data) => {
  // data: { code, bookingAmount }
  const response = await api.post("/rewards/validate-code", data);
  return response.data;
};

export const getMyVouchers = async () => {
  const response = await api.get("/rewards/my-vouchers");
  return response.data;
};

export const redeemPoints = async (payload) => {
  // payload can be number or { tierId, points }
  const body = typeof payload === "object" ? payload : { points: payload };
  const response = await api.post("/rewards/redeem", body);
  return response.data;
};

// Admin Operations
export const getAdminCustomerWallet = async (customerId, page = 1) => {
  const response = await api.get(`/admin/wallet/customer/${customerId}?page=${page}`);
  return response.data;
};

export const adjustPoints = async (data) => {
  // data: { customerId, points, direction: 'CREDIT'|'DEBIT', reason, reference }
  const response = await api.post("/admin/wallet/adjustment", data);
  return response.data;
};

export const freezeWallet = async (data) => {
  // data: { customerId, status: 'active'|'frozen', reason }
  const response = await api.post("/admin/wallet/freeze", data);
  return response.data;
};

export const getReconciliationInfo = async () => {
  const response = await api.get("/admin/wallet/reconciliation");
  return response.data;
};

export const getRedemptions = async (page = 1) => {
  const response = await api.get(`/admin/wallet/redemptions?page=${page}`);
  return response.data;
};

export const getRules = async () => {
  const response = await api.get("/admin/wallet/rules");
  return response.data;
};

export const createRule = async (data) => {
  const response = await api.post("/admin/wallet/rules", data);
  return response.data;
};

export const updateRule = async (id, data) => {
  const response = await api.put(`/admin/wallet/rules/${id}`, data);
  return response.data;
};

// Admin Reward Tier Operations
export const getAdminRewardTiers = async () => {
  const response = await api.get("/admin/wallet/reward-tiers");
  return response.data;
};

export const createAdminRewardTier = async (data) => {
  const response = await api.post("/admin/wallet/reward-tiers", data);
  return response.data;
};

export const updateAdminRewardTier = async (id, data) => {
  const response = await api.put(`/admin/wallet/reward-tiers/${id}`, data);
  return response.data;
};
