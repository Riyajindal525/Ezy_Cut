const asyncHandler =
  require(
    "../utils/asyncHandler"
  );

const {
  createReviewService,
  getSalonReviewsService,
  getMyReviewsService,
} = require(
  "../services/review.service"
);

const createReview =
  asyncHandler(async (
    req,
    res
  ) => {
    const review =
      await createReviewService(
        req.body,
        req.user._id
      );

    res.status(201).json({
      success: true,
      message:
        "Review submitted successfully",
      review,
    });
  });

  const getSalonReviews =
  asyncHandler(async (
    req,
    res
  ) => {
    const reviews =
      await getSalonReviewsService(
        req.params.salonId
      );

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  });

const getMyReviews =
  asyncHandler(async (
    req,
    res
  ) => {
    const reviews =
      await getMyReviewsService(
        req.user._id
      );

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  });

module.exports = {
  createReview,
    getSalonReviews,
    getMyReviews,
};