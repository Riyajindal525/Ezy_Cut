const validateSalon = (req, res, next) => {
  const {
    name,
    address,
    city,
    state,
    pincode,
    phone,
    latitude,
    longitude,
  } = req.body;

  if (
    !name ||
    !address ||
    !city ||
    !state ||
    !pincode ||
    !phone ||
    !latitude ||
    !longitude
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  next();
};

module.exports = {
  validateSalon,
};