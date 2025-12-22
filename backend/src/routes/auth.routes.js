import { Router } from "express";
import { login, register, logout } from "../controllers/auth.controller.js";
import {
  loginLimiter,
  registerLimiter,
} from "../middleware/rateLimit.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  registerValidator,
  loginValidator,
} from "../validators/auth.validators.js";

const router = Router();

// Registro
router.post(
  "/register",
  registerLimiter,
  csrfProtection,
  registerValidator,
  validate,
  register
);

// Login
router.post(
  "/login",
  loginLimiter,
  csrfProtection,
  loginValidator,
  validate,
  login
);

// Logout
router.post("/logout", csrfProtection, logout);

export default router;
