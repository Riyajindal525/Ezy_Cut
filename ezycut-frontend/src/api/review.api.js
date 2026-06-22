import api from "./axios";

export const createReview =
  async (data) => {
    const response =
      await api.post(
        "/reviews",
        data
      );

    return response.data;
  };

export const getSalonReviews =
  async (salonId) => {
    const response =
      await api.get(
        `/reviews/salon/${salonId}`
      );

    return response.data;
  };

export const getMyReviews =
  async () => {
    const response =
      await api.get(
        "/reviews/my-reviews"
      );

    return response.data;
  };