// src/middleware/rateLimit.middleware.js
import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

// 🔐 Limitador para LOGIN
export const loginLimiter = rateLimit({
  windowMs: isProduction ? 15 * 60 * 1000 : 60 * 1000, // 15 min prod, 1 min dev
  max: isProduction ? 10 : 100, // 10 intentos en prod, 100 en dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Has realizado demasiados intentos de inicio de sesión. Inténtalo de nuevo más tarde.",
  },
  handler: (req, res) => {
    return res.status(429).json({
      message:
        "Has realizado demasiados intentos de inicio de sesión. Inténtalo de nuevo más tarde.",
    });
  },
});

// 🔐 Limitador para REGISTRO
export const registerLimiter = rateLimit({
  windowMs: isProduction ? 60 * 60 * 1000 : 5 * 60 * 1000, // 1h prod, 5 min dev
  max: isProduction ? 5 : 50, // 5 en prod, 50 en dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Has realizado demasiados intentos de registro. Inténtalo de nuevo más tarde.",
  },
  handler: (req, res) => {
    return res.status(429).json({
      message:
        "Has realizado demasiados intentos de registro. Inténtalo de nuevo más tarde.",
    });
  },
});

/* ¿Cómo “resetear” el bloqueo ahora mismo?

Como el limitador guarda los conteos en memoria del servidor:

Si quieres resetear todo de una, lo más fácil es:

Reiniciar el backend (Ctrl + C y volver a hacer npm run dev o el script que uses).

O esperar a que pase el tiempo de la ventana:

Antes: 15 min / 1h

Con la nueva config en dev: 1 min / 5 min

3️⃣ Resumen rápido para ti

Sí, el comportamiento que viste era normal: muchos intentos → IP bloqueada por un rato.

En dev lo suavizamos para que no te estés peleando con el limitador cada 2 minutos.

En prod seguirá siendo estricto si pones NODE_ENV=production.

Si ya quieres, en el siguiente paso nos vamos a Helmet + cabeceras de seguridad o revisamos JWT/cookies/front; tú me dices por dónde seguimos y te digo qué archivo tocar. */