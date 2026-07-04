const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure temp directory exists
const tempDir = path.join(__dirname, "../uploads/temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Use Disk Storage for temporary file holding
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// ─── KYC File Filter ──────────────────────────────────────────────────────────
const kycFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and PDF files are allowed for KYC documents"), false);
  }
};

const uploadKyc = multer({
  storage: storage,
  fileFilter: kycFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ─── Salon Image File Filter ──────────────────────────────────────────────────
const salonImageFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG and PNG files are allowed for salon images"), false);
  }
};

const uploadSalonImages = multer({
  storage: storage,
  fileFilter: salonImageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // max 5 images
});

module.exports = { uploadKyc, uploadSalonImages };
