const Booking = require(
  "../models/booking.model"
);

const Salon = require(
  "../models/salon.model"
);

const Service = require(
  "../models/service.model"
);

const generateSlots = require(
  "../utils/slotGenerator"
);

const {
  createNotificationService,
} = require(
  "./notification.service"
);

const getAvailableSlotsService =
  async (
    salonId,
    serviceId,
    date
  ) => {
    const salon =
      await Salon.findById(
        salonId
      );

    if (!salon) {
      throw new Error(
        "Salon not found"
      );
    }

    const service =
      await Service.findById(
        serviceId
      );

    if (!service) {
      throw new Error(
        "Service not found"
      );
    }

    const allSlots =
      generateSlots(
        salon.openingTime,
        salon.closingTime,
        service.duration
      );

    const bookings =
      await Booking.find({
        salon: salonId,
        bookingDate:
          new Date(date),
        status: {
          $nin: [
            "cancelled_by_customer",
            "cancelled_by_owner",
          ],
        },
      });

    const bookedSlots =
      bookings.map(
        (booking) =>
          booking.startTime
      );

    const availableSlots =
      allSlots.filter(
        (slot) =>
          !bookedSlots.includes(
            slot
          )
      );

    return availableSlots;
  };

const createBookingInternal =
  async (
    data,
    customerId,
    session = null
  ) => {
    const salon =
      await Salon.findById(
        data.salonId
      );

    if (!salon) {
      throw new Error(
        "Salon not found"
      );
    }

    const service =
      await Service.findById(
        data.serviceId
      );

    if (!service) {
      throw new Error(
        "Service not found"
      );
    }

    const bookingDate =
      new Date(
        data.bookingDate
      );

    const existingBooking =
      await Booking.findOne({
        salon: salon._id,
        bookingDate,
        startTime:
          data.startTime,
        status: {
          $nin: [
            "cancelled_by_customer",
            "cancelled_by_owner",
          ],
        },
      });

    if (existingBooking) {
      throw new Error(
        "Slot already booked"
      );
    }

    const start =
      new Date(
        `1970-01-01 ${data.startTime}`
      );

    start.setMinutes(
      start.getMinutes() +
        service.duration
    );

    const endTime =
      start
        .toTimeString()
        .slice(0, 5);

    let booking;

    if (session) {
      const result =
        await Booking.create(
          [
            {
              customer:
                customerId,
              salon:
                salon._id,
              service:
                service._id,
              bookingDate,
              startTime:
                data.startTime,
              endTime,
              totalAmount:
                service.price,
              status:
                "confirmed",
              notes:
                data.notes || "",
            },
          ],
          { session }
        );

      booking =
        result[0];
    } else {
      booking =
        await Booking.create({
          customer:
            customerId,
          salon:
            salon._id,
          service:
            service._id,
          bookingDate,
          startTime:
            data.startTime,
          endTime,
          totalAmount:
            service.price,
          status:
            "confirmed",
          notes:
            data.notes || "",
        });
    }

    return {
      booking,
      service,
    };
  };

const createBookingService =
  async (
    data,
    customerId
  ) => {
    const {
      booking,
      service,
    } =
      await createBookingInternal(
        data,
        customerId
      );

    await createNotificationService(
      customerId,
      "Booking Confirmed",
      `Your booking for ${service.name} has been confirmed.`,
      "booking"
    );

    return booking;
  };

const getMyBookingsService =
  async (
    customerId
  ) => {
    const bookings =
      await Booking.find({
        customer:
          customerId,
      })
        .populate(
          "salon",
          "name address city phone"
        )
        .populate(
          "service",
          "name price duration"
        )
        .sort({
          bookingDate: -1,
        });

    return bookings;
  };

const cancelBookingService =
  async (booking) => {
    if (
      booking.status ===
      "completed"
    ) {
      throw new Error(
        "Completed booking cannot be cancelled"
      );
    }

    if (
      booking.status ===
        "cancelled_by_customer" ||
      booking.status ===
        "cancelled_by_owner"
    ) {
      throw new Error(
        "Booking already cancelled"
      );
    }

    booking.status =
      "cancelled_by_customer";

    await booking.save();

    return booking;
  };

const getSalonBookingsService =
  async (salonId) => {
    const bookings =
      await Booking.find({
        salon: salonId,
      })
        .populate(
          "customer",
          "name phone"
        )
        .populate(
          "service",
          "name price duration"
        )
        .sort({
          bookingDate: -1,
        });

    return bookings;
  };

const completeBookingService =
  async (booking) => {
    if (
      booking.status ===
        "cancelled_by_customer" ||
      booking.status ===
        "cancelled_by_owner"
    ) {
      throw new Error(
        "Cancelled booking cannot be completed"
      );
    }

    if (
      booking.status ===
      "completed"
    ) {
      throw new Error(
        "Booking already completed"
      );
    }

    booking.status =
      "completed";

    booking.completedAt =
      new Date();

    await booking.save();

    return booking;
  };

const markNoShowService =
  async (booking) => {
    if (
      booking.status ===
      "completed"
    ) {
      throw new Error(
        "Completed booking cannot be marked as no-show"
      );
    }

    if (
      booking.status ===
        "cancelled_by_customer" ||
      booking.status ===
        "cancelled_by_owner"
    ) {
      throw new Error(
        "Cancelled booking cannot be marked as no-show"
      );
    }

    if (
      booking.status ===
      "no_show"
    ) {
      throw new Error(
        "Booking already marked as no-show"
      );
    }

    booking.status =
      "no_show";

    await booking.save();

    return booking;
  };

const ownerCancelBookingService =
  async (booking) => {
    if (
      booking.status ===
      "completed"
    ) {
      throw new Error(
        "Completed booking cannot be cancelled"
      );
    }

    if (
      booking.status ===
        "cancelled_by_customer" ||
      booking.status ===
        "cancelled_by_owner"
    ) {
      throw new Error(
        "Booking already cancelled"
      );
    }

    booking.status =
      "cancelled_by_owner";

    await booking.save();

    return booking;
  };

module.exports = {
  getAvailableSlotsService,
  createBookingInternal,
  createBookingService,
  getMyBookingsService,
  cancelBookingService,
  getSalonBookingsService,
  completeBookingService,
  markNoShowService,
  ownerCancelBookingService,
};