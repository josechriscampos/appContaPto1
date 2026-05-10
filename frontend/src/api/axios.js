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
  if (import.meta.env.DEV) console.log("✅ CSRF inicializado:", csrfToken.slice(0, 20) + "...");
  return csrfToken;
}

// ✅ Interceptor corregido — inyecta el nuevo token en el retry
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 && !error.config._csrfRetry) {
      error.config._csrfRetry = true;
      try {
        const newToken = await initCSRF();
        // ✅ Inyecta el token nuevo directamente en el config del retry
        error.config.headers = {
          ...error.config.headers,
          "x-csrf-token": newToken,
        };
        return API(error.config);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default API;