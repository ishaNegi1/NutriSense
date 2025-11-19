import api from "./client";

export const submitDailyWellness = (data) =>
  api.post("/api/wellness", data);

export const getWellnessHistory = () =>
  api.get("/api/wellness/history");
