import axios from "axios";

// Centralized API Base URL
// In development, it defaults to http://localhost:5001 (to avoid collision with port 5000)
// In production, configure REACT_APP_API_URL in .env or your hosting dashboard
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://construction-crm-6x9k.onrender.com"
    : "http://localhost:5001");

// =========================================================
// SECURITY: Global Axios Interceptor for JWT Authentication
// =========================================================

// 1. Request Interceptor: Attach Bearer token to all outgoing requests
axios.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore localStorage access errors (e.g. strict security modes)
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Auto-handle session expiration (401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      try {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } catch (e) {}

      // If not already on login page, redirect to login
      if (window.location && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API_BASE_URL;
