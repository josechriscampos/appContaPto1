// record.routes.js — versión optimizada
import { Router } from "express";
import {
    createRecord,
    getRecords,
    saveJournalEntries,
    deleteRecord,
    getRecordEntries, // ← nuevo
} from "../controllers/record.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router = Router();

router.use(authRequired);

router.get("/records", getRecords);                                    // GET sin CSRF
router.post("/records", csrfProtection, createRecord);                // POST con CSRF
router.put("/records/:id/entries", csrfProtection, saveJournalEntries); // PUT con CSRF
router.delete("/records/:id", csrfProtection, deleteRecord);          // DELETE con CSRF
router.get("/records/:id/entries", getRecordEntries); // ← nuevo

export default router;