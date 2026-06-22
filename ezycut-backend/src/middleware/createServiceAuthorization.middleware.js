const Salon = require("../models/salon.model");

const createServiceAuthorization = async (
  req,
  res,
  next
) => {
  try {
    const salon = await Salon.findById(
      req.body.salonId
    );

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found",
      });
    }

    // Admin can create service in any salon
    if (req.user.role === "admin") {
      req.salon = salon;
      return next();
    }

    const isOwner =
      salon.owner.toString() ===
      req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "You do not own this salon",
      });
    }

    req.salon = salon;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports =
  createServiceAuthorization;