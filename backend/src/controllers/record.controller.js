// backend/src/controllers/record.controller.js
import { prisma } from "../db.js";

export const createRecord = async (req, res) => {
  try {
    const { name, date, description, companyName, companyId, bookId } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "El nombre del registro es obligatorio." });
    }

    // Validar que el libro pertenece al usuario si se proporciona
    if (bookId) {
      const book = await prisma.book.findFirst({ where: { id: parseInt(bookId), userId } });
      if (!book) {
        return res.status(404).json({ message: "Libro no encontrado." });
      }
    }

    const newRecord = await prisma.record.create({
      data: {
        name: name.trim(),
        date: date ? new Date(date) : null,
        description: description?.trim() || null,
        companyName: companyName?.trim() || null,
        companyId:   companyId?.trim()   || null,
        userId,
        bookId: bookId ? parseInt(bookId) : null,
      },
    });

    return res.status(201).json(newRecord);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error al crear registro:", error);
    }
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const getRecords = async (req, res) => {
  try {
    const userId = req.user.id;

    const records = await prisma.record.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        date: true,
        description: true,
        companyName: true,
        companyId: true,
        bookId: true,
        createdAt: true,
        _count: { select: { entries: true } },
      },
    });

    return res.status(200).json(records);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error al obtener registros:", error);
    }
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const saveJournalEntries = async (req, res) => {
  try {
    const { id } = req.params;
    const entries = req.body;
    const userId = req.user.id;
    const recordId = parseInt(id);

    if (isNaN(recordId)) {
      return res.status(400).json({ message: "ID de registro inválido." });
    }

    const record = await prisma.record.findFirst({ where: { id: recordId, userId } });
    if (!record) {
      return res.status(404).json({ message: "Registro no encontrado o no autorizado." });
    }

    if (!Array.isArray(entries)) {
      return res.status(400).json({ message: "Formato de asientos inválido." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.journalEntry.deleteMany({ where: { recordId } });

      if (entries.length > 0) {
        await tx.journalEntry.createMany({
          data: entries.map((entry) => {
            const combinedDetail = entry.specificDetail
              ? `${entry.accountDetail} - ${entry.specificDetail}`
              : entry.accountDetail;

            return {
              code: entry.code?.toString().trim() || null,
              detail: combinedDetail,
              debit: entry.debit?.toString() || "0",
              credit: entry.credit?.toString() || "0",
              recordId,
              entryGroupId: entry.entryGroupId?.toString() || null,
            };
          }),
        });
      }
    });

    return res.status(200).json({ message: "Asientos guardados exitosamente." });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error al guardar asientos:", error);
    }
    return res.status(500).json({ message: "Error interno al guardar los asientos." });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(recordId)) {
      return res.status(400).json({ message: "ID de registro inválido." });
    }

    await prisma.$transaction(async (tx) => {
      const record = await tx.record.findFirst({ where: { id: recordId, userId } });
      if (!record) throw new Error("NOT_FOUND");
      await tx.record.delete({ where: { id: recordId } });
    });

    return res.sendStatus(204);
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Registro no encontrado o no autorizado." });
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("Error al eliminar registro:", error);
    }
    return res.status(500).json({ message: "Error interno al eliminar el registro." });
  }
};

export const getRecordEntries = async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(recordId)) {
      return res.status(400).json({ message: "ID de registro inválido." });
    }

    const record = await prisma.record.findFirst({
      where: { id: recordId, userId },
      include: { entries: true },
    });

    if (!record) {
      return res.status(404).json({ message: "Registro no encontrado." });
    }

    return res.status(200).json(record.entries);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error al obtener entries:", error);
    }
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};