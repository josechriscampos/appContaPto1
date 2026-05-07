// frontend/src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5003/api",
  withCredentials: true,
});

export async function initCSRF() {
  const res = await API.get("/csrf-token");
  const csrfToken = res.data.csrfToken;
  API.defaults.headers.common["x-csrf-token"] = csrfToken;

  if (import.meta.env.DEV) {
    console.log("✅ CSRF inicializado");
  }
}

// Interceptor: renueva el CSRF token si expira
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 && !error.config._csrfRetry) {
      error.config._csrfRetry = true;
      try {
        await initCSRF();
        return API(error.config);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default API;