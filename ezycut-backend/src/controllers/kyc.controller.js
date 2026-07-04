const asyncHandler = require("../utils/asyncHandler");
const {
  submitKycService,
  getMyKycService,
  getSalonKycService,
  getAllKycService,
  approveKycService,
  rejectKycService,
} = require("../services/kyc.service");

// POST /api/kyc/submit
// Owner submits KYC for a salon
const submitKyc = asyncHandler(async (req, res) => {
  const { salonId, ownerIdProofType, businessProofType } = req.body;

  if (!salonId) {
    return res.status(400).json({ success: false, message: "salonId is required" });
  }

  const kyc = await submitKycService(
    salonId,
    req.user._id,
    req,
    { ownerIdProofType, businessProofType }
  );

  res.status(201).json({
    success: true,
    message: "KYC documents submitted successfully. Pending admin review.",
    kyc,
  });
});

// GET /api/kyc/my-kyc
// Owner views their own KYC submissions
const getMyKyc = asyncHandler(async (req, res) => {
  const kycList = await getMyKycService(req.user._id);
  res.status(200).json({ success: true, count: kycList.length, kycList });
});

// GET /api/kyc/salon/:salonId
// Admin or owner views KYC for a specific salon
const getSalonKyc = asyncHandler(async (req, res) => {
  const kyc = await getSalonKycService(req.params.salonId);
  if (!kyc) {
    return res.status(404).json({ success: false, message: "No KYC submitted for this salon yet" });
  }
  res.status(200).json({ success: true, kyc });
});

// GET /api/kyc/admin/all?status=pending
// Admin views all KYC submissions (filterable by status)
const getAllKyc = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const kycList = await getAllKycService(status);
  res.status(200).json({ success: true, count: kycList.length, kycList });
});

// PATCH /api/kyc/:kycId/approve
// Admin approves a KYC — also auto-approves the salon
const approveKyc = asyncHandler(async (req, res) => {
  const kyc = await approveKycService(req.params.kycId, req.user._id);
  res.status(200).json({
    success: true,
    message: "KYC approved. Salon is now live.",
    kyc,
  });
});

// PATCH /api/kyc/:kycId/reject
// Admin rejects a KYC with a reason
const rejectKyc = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const kyc = await rejectKycService(req.params.kycId, req.user._id, reason);
  res.status(200).json({
    success: true,
    message: "KYC rejected. Owner has been notified.",
    kyc,
  });
});

module.exports = {
  submitKyc,
  getMyKyc,
  getSalonKyc,
  getAllKyc,
  approveKyc,
  rejectKyc,
};
