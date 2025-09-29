import { Router } from "express";
import { login, register, logout } from "../controllers/auth.controller.js";

const router = Router();

// Ruta para registrar un nuevo usuario
router.post("/register", register);

// Ruta para iniciar sesión
router.post("/login", login);

// Ruta para cerrar sesión
router.post("/logout", logout); // <-- Esta es la línea que probablemente faltaba o estaba incorrecta.

export default router;

