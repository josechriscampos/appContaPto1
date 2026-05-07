// backend/src/app.js
import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import recordRoutes from "./routes/record.routes.js";
import accountRoutes from "./routes/account.routes.js";
import bookRoutes from "./routes/book.routes.js"; // ← nuevo

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const FRONTEND_URL = process.env.CORS_ORIGIN || "http://localhost:5173";

const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
};

app.disable("x-powered-by");
app.use(morgan(isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(helmet({
  contentSecurityPolicy: isProduction ? true : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors(corsOptions));

app.use("/api", authRoutes);
app.use("/api", recordRoutes);
app.use("/api", accountRoutes);
app.use("/api", bookRoutes); // ← nuevo

export default app;