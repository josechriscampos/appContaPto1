// src/app.js
import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import recordRoutes from "./routes/record.routes.js";
import accountRoutes from "./routes/account.routes.js";
import { csrfProtection } from "./middleware/csrf.middleware.js";

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// 🔐 CORS más estricto
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
};

// --- ORDEN DE MIDDLEWARES ---

// Ocultamos tecnología del servidor
app.disable("x-powered-by");

// Logs
app.use(morgan("dev"));

// Lectura de JSON
app.use(express.json());

// Cookies
app.use(cookieParser());

// 🔐 Helmet: cabeceras de seguridad
app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
app.use(cors(corsOptions));

// 🔐 Ruta para obtener el token CSRF
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  return res.json({ csrfToken: req.csrfToken() });
});

// Rutas de la API
app.use("/api", authRoutes);
app.use("/api", recordRoutes);
app.use("/api", accountRoutes);

export default app;
