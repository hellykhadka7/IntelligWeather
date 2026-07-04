import axios from "axios";

// Base URL — uses Vite proxy in dev, VITE_API_BASE_URL in production
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor — unwrap { success, data } envelope
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

// ─── Weather API ──────────────────────────────────────────────────────────────
export const weatherAPI = {
  getCurrent: (params) => api.get("/api/weather/current", { params }),
  getForecast: (params) => api.get("/api/weather/forecast", { params }),
};

// ─── AQI API ──────────────────────────────────────────────────────────────────
export const aqiAPI = {
  getLive: (params) => api.get("/api/aqi/live", { params }),
  getAlerts: (params) => api.get("/api/aqi/alerts", { params }),
};

// ─── Search API ───────────────────────────────────────────────────────────────
export const searchAPI = {
  searchCities: (q, limit = 5) => api.get("/api/search/cities", { params: { q, limit } }),
};

// ─── ML API ───────────────────────────────────────────────────────────────────
export const mlAPI = {
  predict: (body) => api.post("/api/ml/predict", body),
  health: () => api.get("/api/ml/health"),
};

// ─── History API ──────────────────────────────────────────────────────────────
export const historyAPI = {
  getHistory: () => api.get("/api/history"),
  saveSearch: (body) => api.post("/api/history", body),
  clearHistory: () => api.delete("/api/history"),
};

export default api;
