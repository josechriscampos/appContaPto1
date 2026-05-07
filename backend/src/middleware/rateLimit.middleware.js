// backend/src/middleware/rateLimit.middleware.js
import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

// Limitador para LOGIN
export const loginLimiter = rateLimit({
  windowMs: isProduction ? 15 * 60 * 1000 : 60 * 1000,
  max: isProduction ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      message: "Demasiados intentos de inicio de sesión. Inténtalo más tarde.",
    });
  },
});

// Limitador para REGISTRO
export const registerLimiter = rateLimit({
  windowMs: isProduction ? 60 * 60 * 1000 : 5 * 60 * 1000,
  max: isProduction ? 5 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      message: "Demasiados intentos de registro. Inténtalo más tarde.",
    });
  },
});