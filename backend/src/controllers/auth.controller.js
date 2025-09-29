import { prisma } from "../db.js"; // <-- ÚNICA importación de prisma, al principio.
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";

// --- REGISTRO DE USUARIO ---
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: passwordHash,
      },
    });

    const token = await createAccessToken({ id: newUser.id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    if (error.code === 'P2002') {
        return res.status(400).json({ message: "El usuario o correo ya existe." });
    }
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// --- LOGIN DE USUARIO ---
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userFound = await prisma.user.findUnique({
            where: { email },
        });
        if (!userFound) return res.status(400).json({ message: "Credenciales inválidas." });

        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) return res.status(400).json({ message: "Credenciales inválidas." });

        const token = await createAccessToken({ id: userFound.id });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.json({
            id: userFound.id,
            username: userFound.username,
            email: userFound.email,
        });
    } catch (error) {
        console.error("Error en el login:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// --- LOGOUT DE USUARIO ---
export const logout = (req, res) => {
    res.cookie("token", "", {
        expires: new Date(0),
    });
    return res.sendStatus(200);
};

