// backend/src/routes/auth.routes.js
import { Router } from "express";
import { login, register, logout, getMe } from "../controllers/auth.controller.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimit.middleware.js";
import { csrfProtection, csrfTokenHandler } from "../middleware/csrf.middleware.js"; // ← cambia generateToken por csrfTokenHandler
import { validate } from "../middleware/validation.middleware.js";
import { registerValidator, loginValidator } from "../validators/auth.validators.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/csrf-token", csrfTokenHandler); // ← directo, sin lógica en la ruta

router.post("/register", registerLimiter, csrfProtection, registerValidator, validate, register);
router.post("/login", loginLimiter, csrfProtection, loginValidator, validate, login);
router.post("/logout", csrfProtection, logout);
router.get("/me", authRequired, getMe);

export default router;