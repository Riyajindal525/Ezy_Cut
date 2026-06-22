import api from "./axios";

export const joinQueue =
  async (bookingId) => {

    const response =
      await api.post(
        "/queue/join",
        {
          bookingId,
        }
      );

    return response.data;
  };

export const getMyQueue =
  async () => {

    const response =
      await api.get(
        "/queue/my-status"
      );

    return response.data;
  };

export const getSalonQueue = async (salonId) => {
  const response = await api.get(`/queue/salon/${salonId}`);
  return response.data;
};

export const startService = async (id) => {
  const response = await api.patch(`/queue/${id}/start`);
  return response.data;
};

export const completeQueue = async (id) => {
  const response = await api.patch(`/queue/${id}/complete`);
  return response.data;
};

export const cancelQueue = async (id) => {
  const response = await api.patch(`/queue/${id}/cancel`);
  return response.data;
};

export const getQueueByToken = async (tokenCode) => {
  const response = await api.get(`/queue/token/${tokenCode}`);
  return response.data;
};