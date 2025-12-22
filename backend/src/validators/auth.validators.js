import { body } from "express-validator";

export const registerValidator = [
  body("username")
    .trim()
    .notEmpty().withMessage("El nombre de usuario es obligatorio.")
    .isLength({ min: 3, max: 30 })
    .withMessage("El nombre de usuario debe tener entre 3 y 30 caracteres."),

  body("email")
    .trim()
    .notEmpty().withMessage("El correo es obligatorio.")
    .isEmail().withMessage("El correo no tiene un formato válido.")
    .isLength({ max: 100 })
    .withMessage("El correo es demasiado largo."),

  body("password")
    .notEmpty().withMessage("La contraseña es obligatoria.")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage(
      "La contraseña debe tener al menos una mayúscula, una minúscula y un número."
    ),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("El correo es obligatorio.")
    .isEmail().withMessage("El correo no tiene un formato válido.")
    .isLength({ max: 100 })
    .withMessage("El correo es demasiado largo."),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria."),
];
