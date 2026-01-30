import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 30000,
});

let isOffline = false;

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    isOffline = false;
  });
  window.addEventListener("offline", () => {
    isOffline = true;
  });
  isOffline = !navigator.onLine;
}

export const getOfflineStatus = () => isOffline;

api.interceptors.request.use(
  (config) => {
    if (isOffline) {
      return Promise.reject(new Error("OFFLINE"));
    }

    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.message === "OFFLINE") {
      return Promise.reject(new Error("You are offline. Please check your internet connection."));
    }

    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return Promise.reject(new Error("Request timed out. Please try again."));
    }

    const originalRequest = error.config;

    // FIXED: Don't try to refresh token on login/register/forgot-password endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/forgot-password') ||
      originalRequest.url?.includes('/auth/reset-password');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token found");

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const { access_token } = response.data.data;
        localStorage.setItem("access_token", access_token);
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;

        return api(originalRequest);

      } catch (refreshError) {
        console.error("Unable to refresh token:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        if (typeof window !== "undefined") {
          const { toast } = await import("sonner");
          toast.error("Your session has expired. Please login again.", {
            duration: 3000,
          });

          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;