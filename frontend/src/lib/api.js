import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  // Read token from Zustand-persisted storage (single source of truth)
  try {
    const auth = JSON.parse(localStorage.getItem("ekta_auth") || "{}");
    const token = auth?.state?.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ekta_auth");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
