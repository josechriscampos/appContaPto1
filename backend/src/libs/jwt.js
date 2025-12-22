// src/libs/jwt.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_IN =
  process.env.ACCESS_TOKEN_EXPIRES_IN || "30m"; // por defecto 30 minutos

if (!JWT_SECRET) {
  // Falla rápido si falta la clave
  throw new Error("JWT_SECRET no está definido en las variables de entorno.");
}

// Crea un access token con expiración corta
export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        issuer: "emprendum-api", // puedes cambiar el nombre si quieres
      },
      (err, token) => {
        if (err) return reject(err);
        resolve(token);
      }
    );
  });
}
