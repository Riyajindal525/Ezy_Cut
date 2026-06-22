const Booking = require(
  "../models/booking.model"
);

const Salon = require(
  "../models/salon.model"
);

const bookingManagement =
  async (
    req,
    res,
    next
  ) => {
    try {
      const booking =
        await Booking.findById(
          req.params.id
        );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found",
        });
      }

      if (
        req.user.role ===
        "admin"
      ) {
        req.booking = booking;
        return next();
      }

      const salon =
        await Salon.findById(
          booking.salon
        );

      const isOwner =
        salon.owner.toString() ===
        req.user._id.toString();

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message:
            "You do not manage this booking",
        });
      }

      req.booking = booking;

      next();
    } catch (error) {
      next(error);
    }
  };

module.exports =
  bookingManagement;