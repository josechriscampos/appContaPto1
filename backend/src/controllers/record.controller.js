// backend/src/controllers/record.controller.js
import { prisma } from "../db.js";

export const createRecord = async (req, res) => {
  try {
    const { name, date, description, companyName, companyId, bookId } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "El nombre del registro es obligatorio." });
    }

    if (bookId) {
      const book = await prisma.book.findFirst({ where: { id: parseInt(bookId), userId } });
      if (!book) return res.status(404).json({ message: "Libro no encontrado." });
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
    if (process.env.NODE_ENV !== "production") console.error("Error al crear registro:", error);
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
        id: true, name: true, date: true, description: true,
        companyName: true, companyId: true, bookId: true, createdAt: true,
        _count: { select: { entries: true } },
      },
    });
    return res.status(200).json(records);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Error al obtener registros:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// ✅ NUEVO — Guarda o reemplaza UN asiento individual
export const saveEntryGroup = async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    const userId   = req.user.id;
    const { groupId, title, lines } = req.body;

    if (isNaN(recordId)) {
      return res.status(400).json({ message: "ID de registro inválido." });
    }

    if (!groupId || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ message: "Datos del asiento inválidos." });
    }

    const record = await prisma.record.findFirst({ where: { id: recordId, userId } });
    if (!record) {
      return res.status(404).json({ message: "Registro no encontrado o no autorizado." });
    }

    // Filtra líneas vacías
    const validLines = lines.filter(
      (l) => l.code?.trim() && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0)
    );

    if (validLines.length === 0) {
      return res.status(400).json({ message: "El asiento no tiene líneas válidas." });
    }

    await prisma.$transaction(async (tx) => {
      // Elimina las líneas anteriores de este grupo
      await tx.journalEntry.deleteMany({
        where: { recordId, entryGroupId: groupId },
      });

      // Inserta las nuevas líneas
      await tx.journalEntry.createMany({
        data: validLines.map((line) => {
          const combinedDetail = line.specificDetail
            ? `${line.accountDetail} - ${line.specificDetail}`
            : line.accountDetail || "";

          return {
            code:         line.code.toString().trim(),
            detail:       combinedDetail,
            debit:        line.debit?.toString()  || "0",
            credit:       line.credit?.toString() || "0",
            recordId,
            entryGroupId: groupId,
          };
        }),
      });
    });

    return res.status(200).json({ message: "Asiento guardado.", groupId });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Error al guardar asiento:", error);
    return res.status(500).json({ message: "Error interno al guardar el asiento." });
  }
};

// ✅ NUEVO — Elimina todas las líneas de UN asiento
export const deleteEntryGroup = async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    const { groupId } = req.params;
    const userId = req.user.id;

    if (isNaN(recordId)) {
      return res.status(400).json({ message: "ID de registro inválido." });
    }

    const record = await prisma.record.findFirst({ where: { id: recordId, userId } });
    if (!record) {
      return res.status(404).json({ message: "Registro no encontrado o no autorizado." });
    }

    await prisma.journalEntry.deleteMany({
      where: { recordId, entryGroupId: groupId },
    });

    return res.sendStatus(204);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Error al eliminar asiento:", error);
    return res.status(500).json({ message: "Error interno al eliminar el asiento." });
  }
};

// Mantener para compatibilidad (guarda todos a la vez si se necesita)
export const saveJournalEntries = async (req, res) => {
  try {
    const { id } = req.params;
    const entries = req.body;
    const userId = req.user.id;
    const recordId = parseInt(id);

    if (isNaN(recordId)) return res.status(400).json({ message: "ID de registro inválido." });

    const record = await prisma.record.findFirst({ where: { id: recordId, userId } });
    if (!record) return res.status(404).json({ message: "Registro no encontrado o no autorizado." });

    if (!Array.isArray(entries)) return res.status(400).json({ message: "Formato de asientos inválido." });

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
    if (process.env.NODE_ENV !== "production") console.error("Error al guardar asientos:", error);
    return res.status(500).json({ message: "Error interno al guardar los asientos." });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(recordId)) return res.status(400).json({ message: "ID de registro inválido." });

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
    if (process.env.NODE_ENV !== "production") console.error("Error al eliminar registro:", error);
    return res.status(500).json({ message: "Error interno al eliminar el registro." });
  }
};

export const getRecordEntries = async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(recordId)) return res.status(400).json({ message: "ID de registro inválido." });

    const record = await prisma.record.findFirst({
      where: { id: recordId, userId },
      include: { entries: true },
    });

    if (!record) return res.status(404).json({ message: "Registro no encontrado." });

    return res.status(200).json(record.entries);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Error al obtener entries:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};