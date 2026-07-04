const KYC = require("../models/kyc.model");
const Salon = require("../models/salon.model");
const { uploadToCloudinaryOrLocal } = require("../utils/cloudinaryHelper");

// ─── Submit KYC ──────────────────────────────────────────────────────────────
const submitKycService = async (salonId, ownerId, req, body) => {
  const salon = await Salon.findById(salonId);
  if (!salon) throw new Error("Salon not found");

  if (salon.owner.toString() !== ownerId.toString()) {
    throw new Error("Not authorized to submit KYC for this salon");
  }

  const files = req.files || {};

  // Validate mandatory ID proof upload
  if (!files.ownerIdProof || files.ownerIdProof.length === 0) {
    throw new Error("Owner ID proof document is required");
  }

  if (!body.ownerIdProofType) {
    throw new Error("ID proof type is required");
  }

  // Upload ownerIdProof using helper
  const ownerIdProofUrl = await uploadToCloudinaryOrLocal(files.ownerIdProof[0], "kyc", req);

  // Upload businessProof (if any)
  let businessProofUrl = "";
  if (files.businessProof && files.businessProof.length > 0) {
    businessProofUrl = await uploadToCloudinaryOrLocal(files.businessProof[0], "kyc", req);
  }

  // Upload salonImages (if any)
  const salonImageUrls = [];
  if (files.salonImages && files.salonImages.length > 0) {
    for (const img of files.salonImages) {
      const url = await uploadToCloudinaryOrLocal(img, "salons", req);
      salonImageUrls.push(url);
    }
  }

  // Upsert: one KYC record per salon
  const existing = await KYC.findOne({ salon: salonId });

  let kyc;
  if (existing) {
    // Re-submission: reset to pending
    existing.ownerIdProof = ownerIdProofUrl;
    existing.ownerIdProofType = body.ownerIdProofType;
    existing.businessProof = businessProofUrl;
    existing.businessProofType = body.businessProofType || "none";
    existing.salonImages = salonImageUrls;
    existing.kycStatus = "pending";
    existing.rejectionReason = "";
    existing.reviewedBy = null;
    existing.reviewedAt = null;
    existing.submittedAt = new Date();
    await existing.save();
    kyc = existing;
  } else {
    kyc = await KYC.create({
      salon: salonId,
      owner: ownerId,
      ownerIdProof: ownerIdProofUrl,
      ownerIdProofType: body.ownerIdProofType,
      businessProof: businessProofUrl,
      businessProofType: body.businessProofType || "none",
      salonImages: salonImageUrls,
    });
  }

  // Mark salon as kycSubmitted and store uploaded images
  await Salon.findByIdAndUpdate(salonId, {
    kycSubmitted: true,
    ...(salonImageUrls.length > 0 ? { images: salonImageUrls } : {}),
  });

  return kyc;
};

// ─── Get My KYC (owner view) ─────────────────────────────────────────────────
const getMyKycService = async (ownerId) => {
  const salons = await Salon.find({ owner: ownerId }).select("_id name");
  const salonIds = salons.map((s) => s._id);

  const kycList = await KYC.find({ salon: { $in: salonIds } })
    .populate("salon", "name city isApproved")
    .sort({ createdAt: -1 });

  return kycList;
};

// ─── Get KYC for a specific salon (admin/owner) ───────────────────────────────
const getSalonKycService = async (salonId) => {
  const kyc = await KYC.findOne({ salon: salonId })
    .populate("salon", "name city address owner")
    .populate("owner", "name email phone");
  return kyc;
};

// ─── Admin: Get All Pending KYC ───────────────────────────────────────────────
const getAllKycService = async (statusFilter) => {
  const query = statusFilter ? { kycStatus: statusFilter } : {};
  return await KYC.find(query)
    .populate("salon", "name city isApproved kycSubmitted")
    .populate("owner", "name email phone")
    .sort({ submittedAt: -1 });
};

// ─── Admin: Approve KYC ───────────────────────────────────────────────────────
const approveKycService = async (kycId, adminId) => {
  const kyc = await KYC.findById(kycId);
  if (!kyc) throw new Error("KYC record not found");

  kyc.kycStatus = "approved";
  kyc.rejectionReason = "";
  kyc.reviewedBy = adminId;
  kyc.reviewedAt = new Date();
  await kyc.save();

  // Auto-approve the salon when KYC is approved
  await Salon.findByIdAndUpdate(kyc.salon, { isApproved: true });

  return kyc;
};

// ─── Admin: Reject KYC ───────────────────────────────────────────────────────
const rejectKycService = async (kycId, adminId, reason) => {
  const kyc = await KYC.findById(kycId);
  if (!kyc) throw new Error("KYC record not found");

  kyc.kycStatus = "rejected";
  kyc.rejectionReason = reason || "Documents incomplete or invalid";
  kyc.reviewedBy = adminId;
  kyc.reviewedAt = new Date();
  await kyc.save();

  // Revoke salon approval on KYC rejection
  await Salon.findByIdAndUpdate(kyc.salon, { isApproved: false });

  return kyc;
};

module.exports = {
  submitKycService,
  getMyKycService,
  getSalonKycService,
  getAllKycService,
  approveKycService,
  rejectKycService,
};
