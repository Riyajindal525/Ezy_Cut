const asyncHandler = require("../utils/asyncHandler");
const {
  createInvoiceDraftService,
  raiseInvoiceService,
  getInvoiceByIdService,
  getSalonInvoicesService,
  getSalonWalletSummaryService,
  resendInvoiceEmailService,
  verifyInvoiceByCodeService,
  getPlatformRevenueSummaryService,
  getAllInvoicesService,  
  getSettlementReportService,
  markSettlementPaidService,
  getGstReportService,
  getPlatformSettingsService,
  updatePlatformSettingsService,
  getPnlReportService,
} = require("../services/invoice.service");

const createInvoiceDraft = asyncHandler(async (req, res) => {
  const invoice = await createInvoiceDraftService(req.params.bookingId, req.body, req.user._id);
  res.status(201).json({ success: true, invoice });
});

const raiseInvoice = asyncHandler(async (req, res) => {
  const invoice = await raiseInvoiceService(req.params.invoiceId, req.user._id);
  res.status(200).json({ success: true, message: "Invoice raised successfully", invoice });
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await getInvoiceByIdService(req.params.invoiceId);
  if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

   const isOwnerOfSalon = invoice.salon?.owner?.toString() === req.user._id.toString();
  const isCustomer = invoice.customer?._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwnerOfSalon && !isCustomer && !isAdmin) {
    return res.status(403).json({ success: false, message: "Not authorized to view this invoice" });
  }
  
  res.status(200).json({ success: true, invoice });
});

const getSalonInvoices = asyncHandler(async (req, res) => {
  const invoices = await getSalonInvoicesService(req.params.salonId);
  res.status(200).json({ success: true, count: invoices.length, invoices });
});

const getSalonWallet = asyncHandler(async (req, res) => {
  const data = await getSalonWalletSummaryService(req.params.salonId);
  res.status(200).json({ success: true, ...data });
});

const resendInvoiceEmail = asyncHandler(async (req, res) => {
  const result = await resendInvoiceEmailService(req.params.invoiceId, req.user._id);
  res.status(200).json({ success: true, message: result.message });
});

const verifyInvoiceByCode = asyncHandler(async (req, res) => {
  try {
    const result = await verifyInvoiceByCodeService(req.params.invoiceNumber);
    res.status(200).json({ success: true, invoice: result });
  } catch (err) {
    res.status(404).json({ success: false, message: "Invoice not found" });
  }
});

const getPlatformRevenue = asyncHandler(async (req, res) => {
  const data = await getPlatformRevenueSummaryService();
  res.status(200).json({ success: true, ...data });
});

const getAllInvoices = asyncHandler(async (req, res) => {
  const invoices = await getAllInvoicesService();
  res.status(200).json({ success: true, count: invoices.length, invoices });
});

const getSettlementReport = asyncHandler(async (req, res) => {
  const report = await getSettlementReportService();
  res.status(200).json({ success: true, report });
});

const markSettlementPaid = asyncHandler(async (req, res) => {
  const invoice = await markSettlementPaidService(req.params.invoiceId);
  res.status(200).json({ success: true, message: "Marked as paid", invoice });
});

const getGstReport = asyncHandler(async (req, res) => {
  const report = await getGstReportService();
  res.status(200).json({ success: true, report });
});

const getPlatformSettings = asyncHandler(async (req, res) => {
  const settings = await getPlatformSettingsService();
  res.status(200).json({ success: true, settings });
});

const updatePlatformSettings = asyncHandler(async (req, res) => {
  const settings = await updatePlatformSettingsService(req.body);
  res.status(200).json({ success: true, message: "Settings updated", settings });
});

const getPnlReport = asyncHandler(async (req, res) => {
  const data = await getPnlReportService();
  res.status(200).json({ success: true, ...data });
});

module.exports = {
  createInvoiceDraft,
  raiseInvoice,
  getInvoiceById,
  getSalonInvoices,
  getSalonWallet,  
  resendInvoiceEmail,
  verifyInvoiceByCode,
  getPlatformRevenue,
  getAllInvoices,
  getSettlementReport,
  markSettlementPaid,
  getGstReport,
  getPlatformSettings,
  updatePlatformSettings,
  getPnlReport,
};