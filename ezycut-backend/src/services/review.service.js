const Review = require(
  "../models/review.model"
);

const Booking = require(
  "../models/booking.model"
);

const Salon = require(
  "../models/salon.model"
);

const {
  createNotificationService,
} = require(
  "./notification.service"
);

const createReviewService =
  async (
    reviewData,
    customerId
  ) => {
    const {
      bookingId,
      rating,
      comment,
    } = reviewData;

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      throw new Error(
        "Booking not found"
      );
    }

    if (
      booking.customer.toString() !==
      customerId.toString()
    ) {
      throw new Error(
        "Not authorized"
      );
    }

    if (
      booking.status !==
      "completed"
    ) {
      throw new Error(
        "Only completed bookings can be reviewed"
      );
    }

    const existingReview =
      await Review.findOne({
        booking: bookingId,
      });

    if (existingReview) {
      throw new Error(
        "Review already submitted"
      );
    }

    const review =
      await Review.create({
        customer:
          customerId,

        salon:
          booking.salon,

        booking:
          bookingId,

        rating,

        comment,
      });

    const reviews =
      await Review.find({
        salon:
          booking.salon,
      });

    const totalReviews =
      reviews.length;

    const averageRating =
      reviews.reduce(
        (sum, review) =>
          sum + review.rating,
        0
      ) / totalReviews;

    await Salon.findByIdAndUpdate(
      booking.salon,
      {
        rating:
          averageRating,
        totalReviews,
      }
    );

    const salon =
  await Salon.findById(
    booking.salon
  );

await createNotificationService(
  salon.owner,
  "New Review Received",
  `A customer rated your salon ${rating}/5`,
  "review"
);

    return review;
  };

  const getSalonReviewsService =
  async (salonId) => {
    const reviews =
      await Review.find({
        salon: salonId,
      })
        .populate(
          "customer",
          "name"
        )
        .sort({
          createdAt: -1,
        });

    return reviews;
  };

  const getMyReviewsService =
  async (customerId) => {
    const reviews =
      await Review.find({
        customer:
          customerId,
      })
        .populate(
          "salon",
          "name city"
        )
        .sort({
          createdAt: -1,
        });

    return reviews;
  };
  
module.exports = {
  createReviewService,
    getSalonReviewsService,
    getMyReviewsService,
};