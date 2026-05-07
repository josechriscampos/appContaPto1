// backend/src/middleware/csrf.middleware.js
import { doubleCsrf } from "csrf-csrf";

const isProduction = process.env.NODE_ENV === "production";

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,

  // ✅ Requerido en v4 — identifica la sesión del usuario
  // Usamos la cookie del JWT como identificador
  getSessionIdentifier: (req) => req.cookies?.token ?? "anonymous",

  cookieName: isProduction ? "__Host-psifi.x-csrf-token" : "x-csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: isProduction ? "strict" : "lax",
    secure: isProduction,
    path: "/",
  },
  size: 64,
  getTokenFromRequest: (req) =>
    req.headers["x-csrf-token"] || req.body?._csrf,
});

export const csrfProtection = doubleCsrfProtection;

export const csrfTokenHandler = (req, res) => {
  const token = generateCsrfToken(req, res);
  return res.json({ csrfToken: token });
};