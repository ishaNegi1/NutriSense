import api from "./client";

export const submitDailyWellness = (data) =>
  api.post("/wellness/predict", data);

export const getWellnessHistory = () =>
  api.get("/wellness/history");
