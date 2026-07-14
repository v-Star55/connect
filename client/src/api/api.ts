import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true, // REQUIRED for cookies
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config;

    if (originalConfig.url !== "/auth/login" && originalConfig.url !== "/auth/refresh"
      && err.response) {
      // Access Token was expired
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          await api.post("/auth/refresh", {}, { withCredentials: true });
          console.log("Access token refreshed");
          return api(originalConfig);
        } catch (_error) {
          console.log("Access token refresh failed");
          return Promise.reject(_error);
        }
      }
    }

    return Promise.reject(err);
  }
);

// Re-export Auth API endpoints (loginApi is the default export)
export { default } from "./auth";
export { default as loginApi } from "./auth";
export * from "./auth";

// Re-export User API endpoints
export * from "./user";

// Re-export Chat API endpoints
export * from "./chats";
