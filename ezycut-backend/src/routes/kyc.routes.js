const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const { uploadKyc } = require("../middleware/upload.middleware");

const {
  submitKyc,
  getMyKyc,
  getSalonKyc,
  getAllKyc,
  approveKyc,
  rejectKyc,
} = require("../controllers/kyc.controller");

// ─── Owner Routes ─────────────────────────────────────────────────────────────

// POST /api/kyc/submit
// Accepts: ownerIdProof (1 file), businessProof (1 file, optional), salonImages (up to 5)
router.post(
  "/submit",
  protect,
  authorizeRoles("salon_owner", "admin"),
  uploadKyc.fields([
    { name: "ownerIdProof", maxCount: 1 },
    { name: "businessProof", maxCount: 1 },
    { name: "salonImages", maxCount: 5 },
  ]),
  submitKyc
);

// GET /api/kyc/my-kyc
router.get(
  "/my-kyc",
  protect,
  authorizeRoles("salon_owner", "admin"),
  getMyKyc
);

// GET /api/kyc/salon/:salonId
router.get(
  "/salon/:salonId",
  protect,
  authorizeRoles("salon_owner", "admin"),
  getSalonKyc
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/kyc/admin/all?status=pending|approved|rejected
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  getAllKyc
);

// PATCH /api/kyc/:kycId/approve
router.patch(
  "/:kycId/approve",
  protect,
  authorizeRoles("admin"),
  approveKyc
);

// PATCH /api/kyc/:kycId/reject
router.patch(
  "/:kycId/reject",
  protect,
  authorizeRoles("admin"),
  rejectKyc
);

module.exports = router;
