// account.routes.js — versión optimizada
import { Router } from "express";
import { getChartOfAccounts, saveChartOfAccounts } from "../controllers/account.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router = Router();

router.use(authRequired); // Auth en todas las rutas

router.get("/accounts", getChartOfAccounts);                    // GET sin CSRF
router.put("/accounts", csrfProtection, saveChartOfAccounts);  // PUT con CSRF

export default router;