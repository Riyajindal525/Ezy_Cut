import api from "./axios";

export const getServicesBySalon =
  async (salonId) => {
    const response =
      await api.get(
        `/services/salon/${salonId}`
      );

    return response.data;
  };

export const getServiceById =
  async (id) => {
    const response =
      await api.get(
        `/services/${id}`
      );

    return response.data;
  };

export const createService = async (data) => {
  const response = await api.post("/services", data);
  return response.data;
};

export const updateService = async (id, data) => {
  const response = await api.put(`/services/${id}`, data);
  return response.data;
};

export const deleteService = async (id) => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};