const Salon = require("../models/salon.model");

const checkSalonOwnership = async (
  req,
  res,
  next
) => {
  try {
    const salon = await Salon.findById(
      req.params.id
    );

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found",
      });
    }

    const isAdmin =
      req.user.role === "admin";

    const isOwner =
      salon.owner.toString() ===
      req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to manage this salon",
      });
    }

    req.salon = salon;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkSalonOwnership;