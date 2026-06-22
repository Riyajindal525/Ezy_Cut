import api from "./axios";

export const getAvailableSlots =
  async (
    salonId,
    serviceId,
    date
  ) => {

    const response =
      await api.get(
        `/bookings/available-slots?salonId=${salonId}&serviceId=${serviceId}&date=${date}`
      );

    return response.data;
  };

  export const getMyBookings =
  async () => {
    const response =
      await api.get(
        "/bookings/my-bookings"
      );

    return response.data;
  };

export const cancelBooking =
  async (bookingId) => {
    const response =
      await api.patch(
        `/bookings/${bookingId}/cancel`
      );

    return response.data;
  };

export const getSalonBookings = async (salonId) => {
  const response = await api.get(`/bookings/salon/${salonId}`);
  return response.data;
};

export const completeBooking = async (bookingId) => {
  const response = await api.patch(`/bookings/${bookingId}/complete`);
  return response.data;
};

export const markNoShow = async (bookingId) => {
  const response = await api.patch(`/bookings/${bookingId}/no-show`);
  return response.data;
};

export const ownerCancelBooking = async (bookingId) => {
  const response = await api.patch(`/bookings/${bookingId}/owner-cancel`);
  return response.data;
};