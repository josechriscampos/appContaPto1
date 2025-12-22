// src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

export const authRequired = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "No autorizado." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userFound = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        // agrega más campos si los necesitas en req.user
      },
    });

    if (!userFound) {
      return res.status(401).json({ message: "No autorizado." });
    }

    req.user = userFound;
    return next();
  } catch (error) {
    console.error("Error de token:", error.message);

    if (error.name === "TokenExpiredError") {
      // token válido pero ya venció
      return res
        .status(401)
        .json({ message: "Sesión expirada, vuelve a iniciar sesión." });
    }

    return res.status(401).json({ message: "No autorizado." });
  }
};
