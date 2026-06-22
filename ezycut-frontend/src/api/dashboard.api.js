import api from "./axios";

// ===================================
// Owner Dashboard Endpoints
// ===================================

export const getOwnerOverview = async () => {
  const response = await api.get("/dashboard/owner/overview");
  return response.data;
};

export const getOwnerRecentBookings = async () => {
  const response = await api.get("/dashboard/owner/recent-bookings");
  return response.data;
};

export const getOwnerTopServices = async () => {
  const response = await api.get("/dashboard/owner/top-services");
  return response.data;
};

export const getOwnerMonthlyRevenue = async () => {
  const response = await api.get("/dashboard/owner/monthly-revenue");
  return response.data;
};

// ===================================
// Admin Dashboard Endpoints
// ===================================

export const getAdminOverview = async () => {
  const response = await api.get("/dashboard/admin/overview");
  return response.data;
};

export const getAdminRecentSalons = async () => {
  const response = await api.get("/dashboard/admin/recent-salons");
  return response.data;
};

export const getAdminRecentUsers = async () => {
  const response = await api.get("/dashboard/admin/recent-users");
  return response.data;
};

export const getAdminTopSalons = async () => {
  const response = await api.get("/dashboard/admin/top-salons");
  return response.data;
};

export const getAdminMonthlyRevenue = async () => {
  const response = await api.get("/dashboard/admin/monthly-revenue");
  return response.data;
};
