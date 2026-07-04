import api from "./axios";

// POST /api/kyc/submit — multipart/form-data
export const submitKyc = async (formData) => {
  const response = await api.post("/kyc/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// GET /api/kyc/my-kyc — owner views their KYC status
export const getMyKyc = async () => {
  const response = await api.get("/kyc/my-kyc");
  return response.data;
};

// GET /api/kyc/salon/:salonId
export const getSalonKyc = async (salonId) => {
  const response = await api.get(`/kyc/salon/${salonId}`);
  return response.data;
};

// GET /api/kyc/admin/all?status=pending|approved|rejected
export const getAllKyc = async (status = "") => {
  const query = status ? `?status=${status}` : "";
  const response = await api.get(`/kyc/admin/all${query}`);
  return response.data;
};

// PATCH /api/kyc/:kycId/approve
export const approveKyc = async (kycId) => {
  const response = await api.patch(`/kyc/${kycId}/approve`);
  return response.data;
};

// PATCH /api/kyc/:kycId/reject
export const rejectKyc = async (kycId, reason) => {
  const response = await api.patch(`/kyc/${kycId}/reject`, { reason });
  return response.data;
};
