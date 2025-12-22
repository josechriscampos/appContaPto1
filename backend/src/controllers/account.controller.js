import prisma from '../prismaClient.js';

// --- Función para obtener el catálogo completo de un usuario ---
export const getChartOfAccounts = async (req, res) => {
    try {
        const chartOfAccounts = await prisma.account.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                code: 'asc', // Ordenamos las cuentas por su código
            },
        });
        res.status(200).json(chartOfAccounts);
    } catch (error) {
        console.error('Error al obtener el catálogo:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- Función para guardar/actualizar el catálogo completo ---
// Recibe un array de cuentas y las crea o actualiza.
export const saveChartOfAccounts = async (req, res) => {
    const newAccounts = req.body; // El array de cuentas viene del frontend

    if (!Array.isArray(newAccounts)) {
        return res.status(400).json({ message: 'El formato de los datos es incorrecto.' });
    }

    try {
        // Usamos una transacción de Prisma para asegurar que toda la operación
        // se complete con éxito o falle por completo.
        await prisma.$transaction(async (tx) => {
            // 1. Borramos el catálogo antiguo del usuario para empezar de cero.
            await tx.account.deleteMany({
                where: { userId: req.user.id },
            });

            // 2. Insertamos todas las nuevas cuentas.
            await tx.account.createMany({
                data: newAccounts.map(account => ({
                    ...account,
                    userId: req.user.id, // Aseguramos que pertenezcan al usuario correcto
                })),
            });
        });

        res.status(201).json({ message: 'Catálogo guardado exitosamente.' });
    } catch (error) {
        console.error('Error al guardar el catálogo:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
