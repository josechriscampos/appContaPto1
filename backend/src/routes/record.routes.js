// backend/src/routes/record.routes.js
import { Router } from "express";
import {
  createRecord,
  getRecords,
  saveJournalEntries,
  saveEntryGroup,    // ← nuevo
  deleteEntryGroup,  // ← nuevo
  deleteRecord,
  getRecordEntries,
} from "../controllers/record.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router = Router();

router.use(authRequired);

router.get("/records",                      getRecords);
router.post("/records",                     csrfProtection, createRecord);
router.put("/records/:id/entries",          csrfProtection, saveJournalEntries);
router.post("/records/:id/entries/group",   csrfProtection, saveEntryGroup);    // ← nuevo
router.delete("/records/:id/entries/group/:groupId", csrfProtection, deleteEntryGroup); // ← nuevo
router.delete("/records/:id",               csrfProtection, deleteRecord);
router.get("/records/:id/entries",          getRecordEntries);

export default router;