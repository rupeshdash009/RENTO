import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://rento-backend-gmlw.onrender.com/api",
  timeout: 20000,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const path = window.location.pathname;

    if (
      status === 401 &&
      !path.includes("login") &&
      !path.includes("register")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (path.includes("owner-dashboard")) {
        window.location.href = "/owner-login";
      } else if (path.includes("admin-dashboard")) {
        window.location.href = "/admin-login";
      } else if (path.includes("my-bookings")) {
        window.location.href = "/customer-login";
      }
    }

    return Promise.reject(error);
  },
);

export default API;
