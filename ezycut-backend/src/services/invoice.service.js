const Invoice = require("../models/invoice.model");
const Booking = require("../models/booking.model");
const QRCode = require("qrcode");
const generateInvoicePdf = require("../utils/generateInvoicePdf");
const path = require("path");
const { sendInvoiceEmail } = require("../utils/emailer");
const PlatformSettings = require("../models/platformSettings.model");
const Payment = require("../models/payment.model");

/* ─── Config (move to env/admin settings later) ─────────────────── */
const DEFAULT_GST_RATE = 18;
const DEFAULT_COMMISSION_RATE = 8; // %
const DEFAULT_GATEWAY_CHARGE_RATE = 2; // % — approximate, replace with actual gateway fee logic

/* ─── Create Draft Invoice ───────────────────────────────────────── */

const createInvoiceDraftService = async (bookingId, data, salonOwnerId) => {
  const booking = await Booking.findById(bookingId).populate("salon");
  if (!booking) throw new Error("Booking not found");

  if (booking.salon?.owner?.toString() !== salonOwnerId.toString()) {
    throw new Error("Not authorized to generate an invoice for this booking");
  }

  const existing = await Invoice.findOne({ booking: bookingId, status: { $ne: "cancelled" } });
  if (existing) {
    throw new Error("An invoice already exists for this booking");
  }

  const { lineItems, discountAmount = 0, notes = "" } = data;

  if (!lineItems || lineItems.length === 0) {
    throw new Error("At least one line item is required");
  }

  const settings = await PlatformSettings.getSettings();

  const hasCustomRate =
    booking.salon?.customCommissionRate !== null &&
    booking.salon?.customCommissionRate !== undefined;
  const effectiveCommissionRate = hasCustomRate
    ? booking.salon.customCommissionRate
    : settings.commissionRate;

  // Line item prices are GST-INCLUSIVE — the customer already paid this exact
  // total at booking time. We extract the GST portion from within it instead
  // of adding tax on top, so the invoice total never exceeds what was paid.
  const subtotal = lineItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const totalAmount = Math.max(subtotal - discountAmount, 0);

  const gstRate = settings.gstRate;
  const taxableAmount = Math.round((totalAmount * 100) / (100 + gstRate));
  const gstAmount = totalAmount - taxableAmount;

  const commissionAmount = Math.round((totalAmount * effectiveCommissionRate) / 100);
  const gatewayChargeAmount = Math.round((totalAmount * settings.gatewayChargeRate) / 100);
  const salonSettlementAmount = totalAmount - commissionAmount - gatewayChargeAmount;

  const bookingPayment = await Payment.findOne({ booking: bookingId, status: "paid" });
  const amountPaidAtBooking = bookingPayment?.amount || 0;

  const invoice = await Invoice.create({
    booking: bookingId,
    salon: booking.salon._id,
    customer: booking.customer,
    lineItems,
    subtotal,
    discountAmount,
    taxableAmount,
    gstRate,
    gstAmount,
    totalAmount, // same as what the customer actually paid — no inflation
    commissionRate: effectiveCommissionRate,
    commissionAmount,
    gatewayChargeAmount,
    salonSettlementAmount,
    notes,
    amountPaidAtBooking,
    balanceDue: Math.max(totalAmount - amountPaidAtBooking, 0),
    status: "draft",
  });

  const populatedInvoice = await Invoice.findById(invoice._id)
    .populate("salon", "name address city phone")
    .populate("customer", "name phone email")
    .populate("booking", "bookingDate startTime");

  return populatedInvoice;
};

/* ─── Raise Invoice (finalize draft → generate invoice number) ─── */

const raiseInvoiceService = async (invoiceId, salonOwnerId) => {
  const invoice = await Invoice.findById(invoiceId).populate({
    path: "salon",
    select: "owner name address city phone",
  });
  if (!invoice) throw new Error("Invoice not found");

  if (invoice.salon?.owner?.toString() !== salonOwnerId.toString()) {
    throw new Error("Not authorized to raise this invoice");
  }

  if (invoice.status !== "draft") {
    throw new Error("Only draft invoices can be raised");
  }

  const invoiceNumber = await generateInvoiceNumber();

  invoice.invoiceNumber = invoiceNumber;
  invoice.status = "raised";
  invoice.raisedAt = new Date();

  const verifyUrl = `${process.env.FRONTEND_URL || "https://ezycut.co.in"}/verify-invoice/${invoiceNumber}`;
  invoice.qrCodeUrl = await QRCode.toDataURL(verifyUrl, {
    width: 300,
    margin: 1,
    color: { dark: "#022525", light: "#ffffff" },
  });

  // Save FIRST so invoiceNumber, status, and qrCodeUrl are persisted
  await invoice.save();

  // NOW fetch the fully-populated, fully-saved invoice for the PDF
  const populatedForPdf = await Invoice.findById(invoice._id)
    .populate("salon", "name address city phone")
    .populate("customer", "name phone email");

  invoice.pdfUrl = await generateInvoicePdf(populatedForPdf);
  await invoice.save();

  // Send invoice PDF to customer's email — non-blocking failure
  try {
    const pdfAbsolutePath = path.join(__dirname, "..", "uploads", "invoices", `${invoiceNumber}.pdf`);
    await sendInvoiceEmail(populatedForPdf, pdfAbsolutePath);
  } catch (emailErr) {
    console.error("[INVOICE EMAIL FAILED]:", emailErr.message);
    // Don't throw — invoice is already raised successfully, email failure shouldn't block the flow
  }

  return invoice;
};

/* ─── Invoice number generator ──────────────────────────────────── */

const generateInvoiceNumber = async () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const countToday = await Invoice.countDocuments({
    invoiceNumber: { $regex: `^INV-${datePart}` },
  });
  const seq = String(countToday + 1).padStart(4, "0");
  return `INV-${datePart}-${seq}`;
};

/* ─── Fetch Invoices ─────────────────────────────────────────────── */

const getInvoiceByIdService = async (invoiceId) => {
  return await Invoice.findById(invoiceId)
    .populate("booking", "bookingDate startTime")
    .populate("salon", "name address city phone owner")
    .populate("customer", "name phone email");
};

const getSalonInvoicesService = async (salonId) => {
  return await Invoice.find({ salon: salonId })
    .populate("customer", "name phone")
    .populate("booking", "bookingDate")
    .sort({ createdAt: -1 });
};
/* ─── Salon Wallet Summary ──────────────────────────────────────── */

const getSalonWalletSummaryService = async (salonId) => {
  const invoices = await Invoice.find({
    salon: salonId,
    status: { $in: ["raised", "paid"] },
  })
    .populate("customer", "name")
    .sort({ createdAt: -1 });

  const summary = invoices.reduce(
    (acc, inv) => {
      acc.totalRevenue += inv.totalAmount || 0;
      acc.totalCommission += inv.commissionAmount || 0;
      acc.totalGatewayCharges += inv.gatewayChargeAmount || 0;
      acc.totalSettlement += inv.salonSettlementAmount || 0;
      return acc;
    },
    { totalRevenue: 0, totalCommission: 0, totalGatewayCharges: 0, totalSettlement: 0 }
  );

  return { summary, invoices };
};

/* ─── Resend Invoice Email ──────────────────────────────────────── */

const resendInvoiceEmailService = async (invoiceId, salonOwnerId) => {
  const invoice = await Invoice.findById(invoiceId)
    .populate("salon", "name address city phone owner")
    .populate("customer", "name phone email");

  if (!invoice) throw new Error("Invoice not found");

  if (invoice.salon?.owner?.toString() !== salonOwnerId.toString()) {
    throw new Error("Not authorized to resend this invoice");
  }

  if (invoice.status === "draft") {
    throw new Error("Cannot send a draft invoice — please raise it first");
  }

  if (!invoice.pdfUrl) {
    throw new Error("PDF not available for this invoice yet");
  }

  const pdfAbsolutePath = path.join(__dirname, "..", "uploads", "invoices", `${invoice.invoiceNumber}.pdf`);
  const result = await sendInvoiceEmail(invoice, pdfAbsolutePath);

  if (!result.sent) {
    throw new Error(result.reason || "Failed to send email — customer has no email on file");
  }

  return { message: `Invoice sent to ${invoice.customer.email}` };
};

/* ─── Public Verification (no auth) ─────────────────────────────── */

const verifyInvoiceByCodeService = async (invoiceNumber) => {
  const invoice = await Invoice.findOne({ invoiceNumber })
    .populate("salon", "name city")
    .populate("customer", "name");

  if (!invoice) throw new Error("Invoice not found");

  // Return only safe, non-sensitive fields for public verification
  return {
    invoiceNumber: invoice.invoiceNumber,
    salonName: invoice.salon?.name,
    salonCity: invoice.salon?.city,
    customerName: invoice.customer?.name,
    totalAmount: invoice.totalAmount,
    status: invoice.status,
    raisedAt: invoice.raisedAt,
  };
};

/* ─── Admin: Platform-wide Revenue Summary ──────────────────────── */

const getPlatformRevenueSummaryService = async () => {
  const invoices = await Invoice.find({
    status: { $in: ["raised", "paid"] },
  })
    .populate("salon", "name city")
    .populate("customer", "name")
    .sort({ createdAt: -1 });

  const summary = invoices.reduce(
    (acc, inv) => {
      acc.totalRevenue += inv.totalAmount || 0;
      acc.totalCommission += inv.commissionAmount || 0;
      acc.totalGatewayCharges += inv.gatewayChargeAmount || 0;
      acc.totalGST += inv.gstAmount || 0;
      acc.totalSalonSettlements += inv.salonSettlementAmount || 0;
      return acc;
    },
    {
      totalRevenue: 0,
      totalCommission: 0,
      totalGatewayCharges: 0,
      totalGST: 0,
      totalSalonSettlements: 0,
    }
  );

  const salonMap = {};
  invoices.forEach((inv) => {
    const salonId = inv.salon?._id?.toString();
    if (!salonId) return;
    if (!salonMap[salonId]) {
      salonMap[salonId] = {
        salonId,
        salonName: inv.salon.name,
        salonCity: inv.salon.city,
        invoiceCount: 0,
        totalRevenue: 0,
        totalCommission: 0,
      };
    }
    salonMap[salonId].invoiceCount += 1;
    salonMap[salonId].totalRevenue += inv.totalAmount || 0;
    salonMap[salonId].totalCommission += inv.commissionAmount || 0;
  });

  const salonBreakdown = Object.values(salonMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

  return { summary, salonBreakdown, invoiceCount: invoices.length };
};

/* ─── Admin: Settlement Report ──────────────────────────────────── */

const getSettlementReportService = async () => {
  const invoices = await Invoice.find({ status: { $in: ["raised", "paid"] } })
    .populate("salon", "name city")
    .sort({ createdAt: -1 });

  return invoices.map((inv) => ({
    _id: inv._id,
    invoiceNumber: inv.invoiceNumber,
    salonName: inv.salon?.name,
    salonCity: inv.salon?.city,
    salonSettlementAmount: inv.salonSettlementAmount,
    settlementStatus: inv.settlementStatus,
    settlementPaidAt: inv.settlementPaidAt,
    raisedAt: inv.raisedAt,
  }));
};

const markSettlementPaidService = async (invoiceId) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.settlementStatus === "paid") throw new Error("Already marked as paid");

  invoice.settlementStatus = "paid";
  invoice.settlementPaidAt = new Date();
  await invoice.save();

  return invoice;
};

/* ─── Admin: GST Report (monthly breakdown) ─────────────────────── */

const getGstReportService = async () => {
  const invoices = await Invoice.find({ status: { $in: ["raised", "paid"] } }).sort({ createdAt: 1 });

  const monthMap = {};
  invoices.forEach((inv) => {
    const d = new Date(inv.raisedAt || inv.createdAt);
    const key = `${d.toLocaleString("en-IN", { month: "short" })} ${d.getFullYear()}`;
    if (!monthMap[key]) {
      monthMap[key] = { month: key, invoiceCount: 0, taxableAmount: 0, gstAmount: 0 };
    }
    monthMap[key].invoiceCount += 1;
    monthMap[key].taxableAmount += inv.taxableAmount || 0;
    monthMap[key].gstAmount += inv.gstAmount || 0;
  });

  return Object.values(monthMap);
};

/* ─── Admin: Commission Settings ────────────────────────────────── */

const getPlatformSettingsService = async () => {
  return await PlatformSettings.getSettings();
};

const updatePlatformSettingsService = async (data) => {
  const settings = await PlatformSettings.getSettings();
  const { commissionRate, gatewayChargeRate, gstRate } = data;

  if (commissionRate !== undefined) settings.commissionRate = commissionRate;
  if (gatewayChargeRate !== undefined) settings.gatewayChargeRate = gatewayChargeRate;
  if (gstRate !== undefined) settings.gstRate = gstRate;

  await settings.save();
  return settings;
};

/* ─── Admin: All Invoices (platform-wide register) ──────────────── */

const getAllInvoicesService = async () => {
  return await Invoice.find()
    .populate("salon", "name city")
    .populate("customer", "name phone")
    .sort({ createdAt: -1 });
};

/* ─── Admin: P&L / Cash Flow Report (monthly, linked to real invoices) ─── */

const getPnlReportService = async () => {
  const invoices = await Invoice.find({ status: { $in: ["raised", "paid"] } }).sort({ createdAt: 1 });

  const monthMap = {};
  invoices.forEach((inv) => {
    const d = new Date(inv.raisedAt || inv.createdAt);
    const key = `${d.toLocaleString("en-IN", { month: "short" })} ${d.getFullYear()}`;
    if (!monthMap[key]) {
      monthMap[key] = {
        month: key,
        invoiceCount: 0,
        grossRevenue: 0,       // total cash collected from customers
        commissionEarned: 0,   // platform's gross earning
        gatewayCharges: 0,     // cost paid to payment gateway
        settlementsPaid: 0,    // already paid out to salons
        settlementsPending: 0, // still owed to salons
      };
    }
    monthMap[key].invoiceCount += 1;
    monthMap[key].grossRevenue += inv.totalAmount || 0;
    monthMap[key].commissionEarned += inv.commissionAmount || 0;
    monthMap[key].gatewayCharges += inv.gatewayChargeAmount || 0;
    if (inv.settlementStatus === "paid") {
      monthMap[key].settlementsPaid += inv.salonSettlementAmount || 0;
    } else {
      monthMap[key].settlementsPending += inv.salonSettlementAmount || 0;
    }
  });

  const monthly = Object.values(monthMap).map((m) => ({
    ...m,
    netProfit: m.commissionEarned - m.gatewayCharges, // actual P&L bottom line
  }));

  const totals = monthly.reduce(
    (acc, m) => {
      acc.grossRevenue += m.grossRevenue;
      acc.commissionEarned += m.commissionEarned;
      acc.gatewayCharges += m.gatewayCharges;
      acc.netProfit += m.netProfit;
      acc.settlementsPaid += m.settlementsPaid;
      acc.settlementsPending += m.settlementsPending;
      return acc;
    },
    { grossRevenue: 0, commissionEarned: 0, gatewayCharges: 0, netProfit: 0, settlementsPaid: 0, settlementsPending: 0 }
  );

  return { monthly, totals };
};

module.exports = {
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
};