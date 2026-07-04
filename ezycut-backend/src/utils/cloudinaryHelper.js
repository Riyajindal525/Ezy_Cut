const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

/**
 * Uploads a local file to Cloudinary. If Cloudinary credentials are invalid or
 * fail with a 403 Forbidden/error, it automatically falls back to saving
 * the file permanently in the local static uploads folder and returns the local URL.
 * 
 * @param {Object} file - The file object from Multer (file.path, file.filename, file.mimetype)
 * @param {string} folder - Destination folder name ('kyc' or 'salons')
 * @param {Object} req - The Express request object (to construct local absolute URL)
 * @returns {Promise<string>} The uploaded file URL (Cloudinary URL or local server URL)
 */
async function uploadToCloudinaryOrLocal(file, folder, req) {
  if (!file) return "";

  const localFilePath = file.path;
  const filename = file.filename;
  const isPdf = file.mimetype === "application/pdf";
  const publicId = `kyc_${req.user ? req.user._id : "guest"}_${Date.now()}_${file.fieldname}`;

  // 1. Try to upload to Cloudinary
  try {
    console.log(`[Cloudinary] Attempting signed upload for ${file.originalname}...`);
    
    const uploadOptions = {
      folder: `ezycut/${folder}`,
      public_id: publicId,
    };

    if (isPdf) {
      uploadOptions.resource_type = "raw";
    } else {
      uploadOptions.resource_type = "image";
      uploadOptions.transformation = [{ quality: "auto", fetch_format: "auto" }];
    }

    const result = await cloudinary.uploader.upload(localFilePath, uploadOptions);
    console.log(`[Cloudinary] Upload successful: ${result.secure_url}`);

    // Clean up temporary local file
    try {
      fs.unlinkSync(localFilePath);
    } catch (err) {
      console.error("Failed to delete temp file:", err.message);
    }

    return result.secure_url;
  } catch (error) {
    // 2. Fallback to Local Storage if Cloudinary fails
    console.warn(`[Cloudinary] Upload failed (${error.message || error}). Falling back to local storage...`);

    const destDir = path.join(__dirname, `../uploads/${folder}`);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const destPath = path.join(destDir, filename);

    try {
      // Move file from temp to permanent folder
      fs.renameSync(localFilePath, destPath);
      
      // Construct local absolute URL
      const host = req.get("host");
      const protocol = req.protocol;
      const localUrl = `${protocol}://${host}/uploads/${folder}/${filename}`;
      console.log(`[Local Storage] File saved permanently: ${localUrl}`);
      return localUrl;
    } catch (moveError) {
      console.error("Failed to move file to local storage:", moveError);
      throw new Error("Failed to save document. Please check server permissions.");
    }
  }
}

module.exports = { uploadToCloudinaryOrLocal };
