import axiosInstance from "./axiosInstance";
 
export const getAiRecommendation = async ({ faceShape, hairType, occasion, notes }) => {
  const { data } = await axiosInstance.post("/ai-mentor/recommend", {
    faceShape,
    hairType,
    occasion,
    notes,
  });
  return data;
};