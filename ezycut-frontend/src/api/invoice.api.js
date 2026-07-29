import api from "./axios"; 

export const createInvoiceDraft = async (bookingId, data) => {
  const res = await api.post(`/invoices/booking/${bookingId}`, data);
  return res.data;
};

export const raiseInvoice = async (invoiceId) => {
  const res = await api.patch(`/invoices/${invoiceId}/raise`);
  return res.data;
};

export const getInvoiceById = async (invoiceId) => {
  const res = await api.get(`/invoices/${invoiceId}`);
  return res.data;
};
export const getSalonInvoices = async (salonId) => {
  const res = await api.get(`/invoices/salon/${salonId}`);
  return res.data;
};

export const getSalonWallet = async (salonId) => {
  const res = await api.get(`/invoices/salon/${salonId}/wallet`);
  return res.data;
};

export const verifyInvoiceByCode = async (invoiceNumber) => {
  const res = await api.get(`/invoices/verify/${invoiceNumber}`);
  return res.data;
};

export const resendInvoiceEmail = async (invoiceId) => {
  const res = await api.post(`/invoices/${invoiceId}/resend-email`);
  return res.data;
};

export const getPlatformRevenue = async () => {
  const res = await api.get(`/invoices/admin/platform-revenue`);
  return res.data;
};

export const getAllInvoices = async () => {
  const res = await api.get(`/invoices/admin/all`);
  return res.data;
};

export const getSettlementReport = async () => {
  const res = await api.get(`/invoices/admin/settlement-report`);
  return res.data;
};

export const markSettlementPaid = async (invoiceId) => {
  const res = await api.patch(`/invoices/admin/settlement/${invoiceId}/mark-paid`);
  return res.data;
};

export const getGstReport = async () => {
  const res = await api.get(`/invoices/admin/gst-report`);
  return res.data;
};

export const getPlatformSettings = async () => {
  const res = await api.get(`/invoices/admin/settings`);
  return res.data;
};

export const updatePlatformSettings = async (data) => {
  const res = await api.patch(`/invoices/admin/settings`, data);
  return res.data;
};

export const getPnlReport = async () => {
  const res = await api.get(`/invoices/admin/pnl-report`);
  return res.data;
};