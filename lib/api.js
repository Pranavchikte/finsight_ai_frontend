// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// This is an interceptor. It's a piece of code that runs
// BEFORE every single request is sent.
api.interceptors.request.use(
  (config) => {
    // We get the token from localStorage
    const token = localStorage.getItem("access_token");
    if (token) {
      // If the token exists, we add the 'Authorization' header
      // to the request. This is how our backend knows who is making the request.
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
