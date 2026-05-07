// backend/src/middleware/validation.middleware.js
import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      message: "Datos de entrada inválidos.",
      errors: formatted,
    });
  }

  return next(); // ← agregado return para consistencia
};