// src/middleware/csrf.middleware.js
import csurf from "csurf";

const isProduction = process.env.NODE_ENV === "production";

export const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
  },
});
