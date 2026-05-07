// backend/src/routes/book.routes.js
import { Router } from "express";
import {
  getBooks,
  createBook,
  getBookRecords,
  deleteBook,
  updateBook,
} from "../controllers/book.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router = Router();

router.use(authRequired);

router.get("/books",              getBooks);
router.post("/books",             csrfProtection, createBook);
router.get("/books/:id/records",  getBookRecords);
router.put("/books/:id",          csrfProtection, updateBook);
router.delete("/books/:id",       csrfProtection, deleteBook);

export default router;