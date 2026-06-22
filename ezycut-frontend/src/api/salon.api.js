import api from "./axios";

export const getAllSalons =
  async () => {
    const response =
      await api.get(
        "/salons"
      );

    return response.data;
  };

export const getSalonById =
  async (id) => {
    const response =
      await api.get(
        `/salons/${id}`
      );

    return response.data;
  };

export const updateSalon = async (id, data) => {
  const response = await api.put(`/salons/${id}`, data);
  return response.data;
};

export const createSalon = async (data) => {
  const response = await api.post("/salons", data);
  return response.data;
};

export const deleteSalon = async (id) => {
  const response = await api.delete(`/salons/${id}`);
  return response.data;
};

export const assignOwner = async (id, ownerId) => {
  const response = await api.patch(`/salons/${id}/assign-owner`, { ownerId });
  return response.data;
};

export const getNearbySalons = async (longitude, latitude, radius = 5000) => {
  const response = await api.get(
    `/salons/nearby?longitude=${longitude}&latitude=${latitude}&radius=${radius}`
  );
  return response.data;
};