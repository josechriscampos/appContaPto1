import { prisma } from "../db.js";
import bcrypt from "bcryptjs";

// --- REGISTRO DE USUARIO ---
export const register = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    // 1. Hashear la contraseña para guardarla de forma segura
    const passwordHash = await bcrypt.hash(password, 10); // 10 es el nivel de encriptación

    // 2. Crear el nuevo usuario en la base de datos usando Prisma
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: passwordHash, // Guardamos la contraseña hasheada
      },
    });

    // 3. Devolver una respuesta al cliente con los datos del usuario creado
    // (Omitimos la contraseña por seguridad)
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    // Manejar el caso de que el email ya exista
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(400).json({ message: "El correo electrónico ya está en uso" });
    }
    // Manejar otros errores
    console.error("Error en el registro:", error);
    res.status(500).json({ message: "Ocurrió un error en el servidor" });
  }
};


// --- LOGIN DE USUARIO ---
export const login = (req, res) => {
    // Dejaremos esta lógica para el siguiente paso,
    // por ahora nos enfocamos en que el registro funcione.
    res.send("login");
};

