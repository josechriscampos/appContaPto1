// backend/src/controllers/account.controller.js
import { prisma } from "../db.js"; // ✅ import correcto y consistente

export const getChartOfAccounts = async (req, res) => {
  try {
    const chartOfAccounts = await prisma.account.findMany({
      where: { userId: req.user.id },
      orderBy: { code: "asc" },
    });

    return res.status(200).json(chartOfAccounts);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error al obtener catálogo:", error);
    }
    return res.status(500).json({ 
      message: "Error interno del servidor." 
    });
  }
};

export const saveChartOfAccounts = async (req, res) => {
  const newAccounts = req.body;

  // Validación de formato y contenido
  if (!Array.isArray(newAccounts) || newAccounts.length === 0) {
    return res.status(400).json({ 
      message: "El catálogo no puede estar vacío." 
    });
  }

  // Validar que cada cuenta tenga los campos requeridos
  const isValid = newAccounts.every(
    (a) => a.code && a.name && a.type && a.category && a.levelType
  );

  if (!isValid) {
    return res.status(400).json({ 
      message: "Todas las cuentas deben tener código, nombre, tipo, categoría y nivel." 
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.account.deleteMany({ where: { userId: req.user.id } });

      await tx.account.createMany({
        data: newAccounts.map((account) => ({
          // ✅ Solo campos explícitos, sin spread del body
          code: account.code.toString().trim(),
          name: account.name.toString().trim(),
          type: account.type.toString().trim(),
          category: account.category.toString().trim(),
          levelType: account.levelType.toString().trim(),
          userId: req.user.id,
        })),
      });
    });

    return res.status(201).json({ 
      message: "Catálogo guardado exitosamente." 
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error al guardar catálogo:", error);
    }
    return res.status(500).json({ 
      message: "Error interno del servidor." 
    });
  }
};