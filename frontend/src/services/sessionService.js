import api from "./api";

const saveSession = (data) => api.post("/session/save", data);
const getSession = () => api.get("/session");
const clearSession = () => api.delete("/session");

export default {
  saveSession,
  getSession,
  clearSession
};