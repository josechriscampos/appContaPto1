// backend/src/controllers/auth.controller.js
import { prisma } from "../db.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import { blacklistToken } from "../libs/tokenBlacklist.js";

const isStrongPassword = (password) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongPasswordRegex.test(password);
};

const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
};

// --------- REGISTRO ---------
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: { username, email, password: passwordHash },
    });

    // Incluir datos en el token para no consultar BD en cada request
    const token = createAccessToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });

    res.cookie("token", token, authCookieOptions);

    return res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error en registro:", error);
    }

    if (error.code === "P2002") {
      return res.status(409).json({ message: "El usuario o correo ya existe." });
    }

    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// --------- LOGIN ---------
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios." });
    }

    const userFound = await prisma.user.findUnique({ where: { email } });

    if (!userFound) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    // Incluir datos en el token
    const token = createAccessToken({
      id: userFound.id,
      username: userFound.username,
      email: userFound.email,
    });

    res.cookie("token", token, authCookieOptions);

    return res.json({
      id: userFound.id,
      username: userFound.username,
      email: userFound.email,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error en login:", error);
    }
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// --------- LOGOUT ---------
export const logout = (req, res) => {
  const token = req.cookies?.token;

  // Invalidar el token server-side
  if (token) {
    blacklistToken(token);
  }

  res.cookie("token", "", {
    ...authCookieOptions,
    expires: new Date(0),
  });

  return res.sendStatus(200);
};

export const getMe = (req, res) => {
  // req.user viene del authRequired middleware
  return res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
  });
};