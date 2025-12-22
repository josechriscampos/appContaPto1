// src/routes/record.routes.js
import { Router } from "express";
import {
  createRecord,
  getRecords,
  saveJournalEntries,
  deleteRecord,
} from "../controllers/record.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router = Router();

// Protege todas las rutas: requiere auth + CSRF
router.use(authRequired);
router.use(csrfProtection);

// Rutas existentes para obtener y crear registros
router.get("/records", getRecords);
router.post("/records", createRecord);
router.put("/records/:id/entries", saveJournalEntries);

// Eliminar registro
router.delete("/records/:id", deleteRecord);

export default router;
