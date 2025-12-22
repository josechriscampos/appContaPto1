// src/routes/account.routes.js
import { Router } from "express";
import {
  getChartOfAccounts,
  saveChartOfAccounts,
} from "../controllers/account.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router = Router();

// Auth + CSRF
router.use(authRequired);
router.use(csrfProtection);

// Ruta para obtener el catálogo del usuario logueado
router.get("/accounts", getChartOfAccounts);

// Ruta para guardar/actualizar el catálogo completo del usuario
router.put("/accounts", saveChartOfAccounts);

export default router;
