// backend/src/controllers/auth.controller.js
import { prisma } from "../db.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";

// --------- HELPERS DE SEGURIDAD ---------

// Reglas de contraseña:
// - mínimo 8 caracteres
// - al menos 1 mayúscula, 1 minúscula y 1 número
const isStrongPassword = (password) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongPasswordRegex.test(password);
};

// Opciones de cookie seguras (dev vs prod)
const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,               // No accesible desde JS en el navegador
  secure: isProduction,         // Solo por HTTPS en producción
  sameSite: isProduction ? "strict" : "lax",
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
};

// --------- REGISTRO DE USUARIO ---------
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validaciones básicas
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
      });
    }

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: passwordHash,
      },
    });

    // Solo el ID en el token
    const token = await createAccessToken({ id: newUser.id });

    res.cookie("token", token, authCookieOptions);

    return res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });
  } catch (error) {
    console.error("Error en el registro:", error);

    // P2002 = violación de clave única (username o email)
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "El usuario o correo ya existe." });
    }

    return res
      .status(500)
      .json({ message: "Error interno del servidor." });
  }
};

// --------- LOGIN DE USUARIO ---------
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validaciones básicas
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Correo y contraseña son obligatorios." });
    }

    const userFound = await prisma.user.findUnique({
      where: { email },
    });

    // No revelamos si el correo existe o no
    if (!userFound) {
      return res
        .status(401)
        .json({ message: "Credenciales inválidas." });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Credenciales inválidas." });
    }

    const token = await createAccessToken({ id: userFound.id });

    res.cookie("token", token, authCookieOptions);

    return res.json({
      id: userFound.id,
      username: userFound.username,
      email: userFound.email,
    });
  } catch (error) {
    console.error("Error en el login:", error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor." });
  }
};

// --------- LOGOUT DE USUARIO ---------
export const logout = (req, res) => {
  res.cookie("token", "", {
    ...authCookieOptions,
    expires: new Date(0),
  });

  return res.sendStatus(200);
};
