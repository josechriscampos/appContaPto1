// backend/src/controllers/book.controller.js
import { prisma } from "../db.js";

// Obtener todos los libros del usuario con conteo de registros
export const getBooks = async (req, res) => {
  try {
    const userId = req.user.id;

    const books = await prisma.book.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        companyName: true,
        companyId: true,
        createdAt: true,
        _count: { select: { records: true } },
      },
    });

    return res.status(200).json(books);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error al obtener libros:", error);
    }
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Crear un nuevo libro
export const createBook = async (req, res) => {
  try {
    const { name, companyName, companyId } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "El nombre del libro es obligatorio." });
    }

    const newBook = await prisma.book.create({
      data: {
        name: name.trim(),
        companyName: companyName?.trim() || null,
        companyId:   companyId?.trim()   || null,
        userId,
      },
    });

    return res.status(201).json(newBook);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error al crear libro:", error);
    }
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener registros de un libro específico
export const getBookRecords = async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(bookId)) {
      return res.status(400).json({ message: "ID de libro inválido." });
    }

    const book = await prisma.book.findFirst({
      where: { id: bookId, userId },
    });

    if (!book) {
      return res.status(404).json({ message: "Libro no encontrado." });
    }

    const records = await prisma.record.findMany({
      where: { bookId, userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        date: true,
        description: true,
        companyName: true,
        companyId: true,
        createdAt: true,
        _count: { select: { entries: true } },
      },
    });

    return res.status(200).json({ book, records });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error al obtener registros del libro:", error);
    }
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Eliminar un libro (y sus registros en cascada)
export const deleteBook = async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(bookId)) {
      return res.status(400).json({ message: "ID de libro inválido." });
    }

    await prisma.$transaction(async (tx) => {
      const book = await tx.book.findFirst({ where: { id: bookId, userId } });
      if (!book) throw new Error("NOT_FOUND");

      // Eliminar entries de todos los records del libro
      const records = await tx.record.findMany({ where: { bookId } });
      for (const record of records) {
        await tx.journalEntry.deleteMany({ where: { recordId: record.id } });
      }

      await tx.record.deleteMany({ where: { bookId } });
      await tx.book.delete({ where: { id: bookId } });
    });

    return res.sendStatus(204);
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Libro no encontrado." });
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("Error al eliminar libro:", error);
    }
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Actualizar nombre/datos de un libro
export const updateBook = async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const userId = req.user.id;
    const { name, companyName, companyId } = req.body;

    if (isNaN(bookId)) {
      return res.status(400).json({ message: "ID de libro inválido." });
    }

    const book = await prisma.book.findFirst({ where: { id: bookId, userId } });
    if (!book) {
      return res.status(404).json({ message: "Libro no encontrado." });
    }

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: {
        name: name?.trim() || book.name,
        companyName: companyName?.trim() || null,
        companyId:   companyId?.trim()   || null,
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error al actualizar libro:", error);
    }
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};