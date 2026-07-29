const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
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
} = require("../controllers/invoice.controller");

// Public — no auth required, used by QR code scanning
router.get("/verify/:invoiceNumber", verifyInvoiceByCode);

// Admin — platform-wide revenue summary
router.get(
  "/admin/platform-revenue",
  protect,
  authorizeRoles("admin"),
  getPlatformRevenue
);

router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  getAllInvoices
);

router.get("/admin/settlement-report", protect, authorizeRoles("admin"), getSettlementReport);
router.patch("/admin/settlement/:invoiceId/mark-paid", protect, authorizeRoles("admin"), markSettlementPaid);
router.get("/admin/gst-report", protect, authorizeRoles("admin"), getGstReport);
router.get("/admin/settings", protect, authorizeRoles("admin", "salon_owner", "customer"), getPlatformSettings);
router.patch("/admin/settings", protect, authorizeRoles("admin"), updatePlatformSettings);
router.patch("/admin/settings", protect, authorizeRoles("admin"), updatePlatformSettings);

// POST /api/invoices/booking/:bookingId  — create draft
router.post(
  "/booking/:bookingId",
  protect,
  authorizeRoles("salon_owner", "admin"),
  createInvoiceDraft
);

// PATCH /api/invoices/:invoiceId/raise  — finalize draft
router.patch(
  "/:invoiceId/raise",
  protect,
  authorizeRoles("salon_owner", "admin"),
  raiseInvoice
);

// GET /api/invoices/:invoiceId
router.get("/:invoiceId", protect, getInvoiceById);

// GET /api/invoices/salon/:salonId
router.get(
  "/salon/:salonId",
  protect,
  authorizeRoles("salon_owner", "admin"),
  getSalonInvoices
);

router.get(
  "/salon/:salonId/wallet",
  protect,
  authorizeRoles("salon_owner", "admin"),
  getSalonWallet
);

router.post(
  "/:invoiceId/resend-email",
  protect,
  authorizeRoles("salon_owner", "admin"),
  resendInvoiceEmail
);
router.get("/admin/pnl-report", protect, authorizeRoles("admin"), getPnlReport);

module.exports = router;