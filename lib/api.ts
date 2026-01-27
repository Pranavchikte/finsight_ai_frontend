import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// REQUEST INTERCEPTOR: Attaches the access token to every outgoing request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handles token expiration and automatic refresh.
// ... (imports and first interceptor stay the same)

// RESPONSE INTERCEPTOR: Handles token expiration and automatic refresh.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
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
        // FIX #8: SESSION EXPIRY FEEDBACK
        console.error("Unable to refresh token:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        if (typeof window !== "undefined") {
          // Show toast notification before redirect
          const { toast } = await import("sonner");
          toast.error("Your session has expired. Please login again.", {
            duration: 3000,
          });

          // Delay redirect to let user see the message
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