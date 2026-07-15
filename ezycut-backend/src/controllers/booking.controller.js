const asyncHandler = require(
  "../utils/asyncHandler"
);

const {
  getAvailableSlotsService,
  createBookingService,
  acceptBookingService,
  getMyBookingsService,
  cancelBookingService,
  getSalonBookingsService,
  completeBookingService,
  markNoShowService,
  ownerCancelBookingService,
} = require(
  "../services/booking.service"
);

const getAvailableSlots =
  asyncHandler(async (
    req,
    res
  ) => {
    const {
      salonId,
      serviceId,
      date,
    } = req.query;

    const slots =
      await getAvailableSlotsService(
        salonId,
        serviceId,
        date
      );

    res.status(200).json({
      success: true,
      slots,
    });
  });

const createBooking =
  asyncHandler(async (
    req,
    res
  ) => {
    const booking =
      await createBookingService(
        req.body,
        req.user._id
      );

    res.status(201).json({
      success: true,
      message:
        "Booking created successfully",
      booking,
    });
  });

const getMyBookings =
  asyncHandler(async (
    req,
    res
  ) => {
    const bookings =
      await getMyBookingsService(
        req.user._id
      );

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  });

const cancelBooking =
  asyncHandler(async (
    req,
    res
  ) => {
    const booking =
      await cancelBookingService(
        req.booking
      );

    res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully",
      booking,
    });
  });

const getSalonBookings =
  asyncHandler(async (
    req,
    res
  ) => {
    const bookings =
      await getSalonBookingsService(
        req.params.salonId
      );

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  });

const completeBooking =
  asyncHandler(async (
    req,
    res
  ) => {
    const booking =
      await completeBookingService(
        req.booking
      );

    res.status(200).json({
      success: true,
      message:
        "Booking completed successfully",
      booking,
    });
  });

const markNoShow =
  asyncHandler(async (
    req,
    res
  ) => {
    const booking =
      await markNoShowService(
        req.booking
      );

    res.status(200).json({
      success: true,
      message:
        "Booking marked as no-show",
      booking,
    });
  });

const ownerCancelBooking =
  asyncHandler(async (
    req,
    res
  ) => {
    const booking =
      await ownerCancelBookingService(
        req.booking,
        req.body?.reason || ""
      );

    res.status(200).json({
      success: true,
      message:
        "Booking cancelled by owner",
      booking,
    });
  });

const acceptBooking =
  asyncHandler(async (
    req,
    res
  ) => {
    const booking =
      await acceptBookingService(
        req.booking
      );

    res.status(200).json({
      success: true,
      message:
        "Booking accepted and confirmed",
      booking,
    });
  });

module.exports = {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
  getSalonBookings,
  completeBooking,
  markNoShow,
  ownerCancelBooking,
  acceptBooking,
};