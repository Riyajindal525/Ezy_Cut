const Booking = require(
  "../models/booking.model"
);

const bookingOwnership = async (
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
      req.user.role === "admin"
    ) {
      req.booking = booking;
      return next();
    }

    const isOwner =
      booking.customer.toString() ===
      req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "Not authorized to access this booking",
      });
    }

    req.booking = booking;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports =
  bookingOwnership;