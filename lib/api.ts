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
api.interceptors.response.use(
  (response) => response, // Directly return successful responses.
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is a 401 (Unauthorized) and we haven't already retried.
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark this request as a retry attempt.

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token found");

        // Request a new access token from the /refresh endpoint.
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        // Get the new access token from the successful refresh response.
        const { access_token } = response.data.data;

        // Store the new access token in local storage.
        localStorage.setItem("access_token", access_token);

        // Update the authorization header for the original failed request.
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;

        // Retry the original request with the new token.
        return api(originalRequest);

      } catch (refreshError) {
        // If refreshing the token fails, log the user out.
        console.error("Unable to refresh token:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        // Redirect to login page.
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        return Promise.reject(refreshError);
      }
    }

    // For any other errors, just return the error.
    return Promise.reject(error);
  }
);

export default api;