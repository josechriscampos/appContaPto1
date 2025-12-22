// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5003/api",
  withCredentials: true, // necesario para que viajen cookies (JWT + CSRF)
});

// Inicializa CSRF: pide el token al backend y lo añade a los headers por defecto
export async function initCSRF() {
  const res = await API.get("/csrf-token");
  const csrfToken = res.data.csrfToken;

  // Este header es el que csurf espera
  API.defaults.headers.common["X-CSRF-Token"] = csrfToken;
  console.log("✅ CSRF inicializado:", csrfToken);
}

export default API;
