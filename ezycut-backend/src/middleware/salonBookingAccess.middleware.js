const Salon = require(
  "../models/salon.model"
);

const salonBookingAccess =
  async (
    req,
    res,
    next
  ) => {
    try {
      const salon =
        await Salon.findById(
          req.params.salonId
        );

      if (!salon) {
        return res.status(404).json({
          success: false,
          message:
            "Salon not found",
        });
      }

      if (
        req.user.role === "admin"
      ) {
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
  salonBookingAccess;