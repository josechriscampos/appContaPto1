// backend/src/validators/auth.validators.js
import { body } from "express-validator";

export const registerValidator = [
  body("username")
    .trim()
    .notEmpty().withMessage("El nombre de usuario es obligatorio.")
    .isLength({ min: 3, max: 30 })
    .withMessage("El nombre de usuario debe tener entre 3 y 30 caracteres.")
    // Solo caracteres seguros
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("El nombre de usuario solo puede contener letras, números, _ y -.")
    .escape(),

  body("email")
    .trim()
    .notEmpty().withMessage("El correo es obligatorio.")
    .isEmail().withMessage("El correo no tiene un formato válido.")
    .isLength({ max: 100 }).withMessage("El correo es demasiado largo.")
    // Normaliza: "Usuario@Gmail.COM" → "usuario@gmail.com"
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("La contraseña es obligatoria.")
    .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage("La contraseña debe tener al menos una mayúscula, una minúscula y un número."),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("El correo es obligatorio.")
    .isEmail().withMessage("El correo no tiene un formato válido.")
    .isLength({ max: 100 }).withMessage("El correo es demasiado largo.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("La contraseña es obligatoria.")
    // ← Límite máximo para evitar ataques de bcrypt con passwords enormes
    .isLength({ max: 72 })
    .withMessage("Contraseña inválida."),
];