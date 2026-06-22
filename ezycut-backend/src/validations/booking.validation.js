const validateBooking = (
  req,
  res,
  next
) => {
  const {
    salonId,
    serviceId,
    bookingDate,
    startTime,
  } = req.body;

  if (
    !salonId ||
    !serviceId ||
    !bookingDate ||
    !startTime
  ) {
    return res.status(400).json({
      success: false,
      message:
        "salonId, serviceId, bookingDate and startTime are required",
    });
  }

  next();
};

module.exports = {
  validateBooking,
};