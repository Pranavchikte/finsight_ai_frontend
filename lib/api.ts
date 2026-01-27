import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 30000, // ADDED: 30 second timeout (FIX #20)
});

// ADDED: Offline detection state (FIX #19)
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

// ADDED: Export function to check offline status (FIX #19)
export const getOfflineStatus = () => isOffline;

// REQUEST INTERCEPTOR: Attaches the access token to every outgoing request.
api.interceptors.request.use(
  (config) => {
    // ADDED: Check if offline before making request (FIX #19)
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

// RESPONSE INTERCEPTOR: Handles token expiration and automatic refresh.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ADDED: Handle offline errors (FIX #19)
    if (error.message === "OFFLINE") {
      return Promise.reject(new Error("You are offline. Please check your internet connection."));
    }

    // ADDED: Handle timeout errors (FIX #20)
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return Promise.reject(new Error("Request timed out. Please try again."));
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
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