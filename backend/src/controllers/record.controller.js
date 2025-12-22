import { prisma } from "../db.js";

// createRecord (sin cambios)
export const createRecord = async (req, res) => {
  try {
    const { name, date, description } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res
        .status(400)
        .json({ message: "El nombre del registro es obligatorio." });
    }

    const newRecord = await prisma.record.create({
      data: { name, date: date ? new Date(date) : null, description, userId },
    });
    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error al crear el registro:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al crear el registro." });
  }
};

// getRecords (sin cambios)
export const getRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await prisma.record.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { entries: true },
    });
    res.status(200).json(records);
  } catch (error) {
    console.error("Error al obtener los registros:", error);
    res
      .status(500)
      .json({
        message: "Error interno del servidor al obtener los registros.",
      });
  }
};


// --- FUNCIÓN DE GUARDADO COMPLETAMENTE CORREGIDA Y ADAPTADA A TU SCHEMA ---
export const saveJournalEntries = async (req, res) => {
  try {
    const { id } = req.params;
    const entries = req.body; // Recibimos las entradas del frontend
    const userId = req.user.id;

    const record = await prisma.record.findFirst({
      where: { id: parseInt(id), userId: userId },
    });
    if (!record) {
      return res
        .status(404)
        .json({ message: "Registro no encontrado o no autorizado." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.journalEntry.deleteMany({ where: { recordId: parseInt(id) } });

      if (entries && entries.length > 0) {
        await tx.journalEntry.createMany({
          data: entries.map((entry) => {
            // Lógica para combinar el nombre de la cuenta y el detalle específico
            const combinedDetail = entry.specificDetail
              ? `${entry.accountDetail} - ${entry.specificDetail}`
              : entry.accountDetail;
            
            return {
              code: entry.code || null,
              detail: combinedDetail, // Guardamos el detalle combinado en el campo 'detail'
              debit: parseFloat(entry.debit) || 0,
              credit: parseFloat(entry.credit) || 0,
              recordId: parseInt(id),
              // --- ¡ESTA ES LA LÍNEA QUE FALTABA! ---
              // Ahora guardamos el ID del grupo que viene del frontend
              entryGroupId: entry.entryGroupId 
            };
          }),
        });
      }
    });

    res.status(200).json({ message: "Asientos guardados exitosamente." });
  } catch (error) {
    console.error("Error al guardar asientos:", error);
    res.status(500).json({ message: "Error interno al guardar los asientos." });
  }
};


// deleteRecord (sin cambios)
export const deleteRecord = async (req, res) => {
  try {
    const recordIdToDelete = parseInt(req.params.id);
    const userId = req.user.id;

    await prisma.$transaction(async (tx) => {
      const record = await tx.record.findFirst({
        where: {
          id: recordIdToDelete,
          userId: userId,
        },
      });

      if (!record) {
        throw new Error("Registro no encontrado o no autorizado.");
      }

      await tx.journalEntry.deleteMany({
        where: { recordId: recordIdToDelete },
      });

      await tx.record.delete({
        where: { id: recordIdToDelete },
      });
    });

    return res.sendStatus(204);
  } catch (error) {
    if (error.message.includes("autorizado")) {
      return res.status(404).json({ message: error.message });
    }

    console.error("Error al eliminar el registro:", error);
    return res
      .status(500)
      .json({ message: "Error interno al eliminar el registro." });
  }
};