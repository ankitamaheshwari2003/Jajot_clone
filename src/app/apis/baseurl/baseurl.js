import axios from "axios";

// Stores the single backend API base URL used by all shared API helpers.
export const BASE_URL =
"https://amazon-multi-vendor-3.onrender.com/api";

// Creates the shared Axios client so every backend API uses the same base URL.
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;



    if (status !== 401 && status !== 404) {
      console.warn("API request failed:", {
        url: error?.config?.url || "",
        status: status || 0,
        message:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Request failed"
      });
    }

    return Promise.reject(error);
  }
);
