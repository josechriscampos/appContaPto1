// backend/src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../libs/tokenBlacklist.js";

export const authRequired = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "No autorizado." });
    }

    // Verificar si el token fue invalidado por logout
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ message: "Sesión inválida." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Usamos los datos del token directamente, sin golpear la BD
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
    };

    return next();
  } catch (error) {
    // Solo mostrar errores en desarrollo
    if (process.env.NODE_ENV !== "production") {
      console.error("Error de token:", error.message);
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Sesión expirada." });
    }

    return res.status(401).json({ message: "No autorizado." });
  }
};