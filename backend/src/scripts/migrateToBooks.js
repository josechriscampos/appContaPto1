// backend/src/scripts/migrateToBooks.js
// Ejecutar UNA SOLA VEZ: node src/scripts/migrateToBooks.js

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Iniciando migración de registros a libros...");

  // Obtener todos los registros sin bookId
  const records = await prisma.record.findMany({
    where: { bookId: null },
    select: { id: true, name: true, companyName: true, companyId: true, userId: true },
  });

  console.log(`📋 Registros a migrar: ${records.length}`);

  for (const record of records) {
    // Crear un libro con el mismo nombre y datos de empresa
    const book = await prisma.book.create({
      data: {
        name: record.companyName || record.name,
        companyName: record.companyName,
        companyId:   record.companyId,
        userId:      record.userId,
      },
    });

    // Asignar el registro a ese libro
    await prisma.record.update({
      where: { id: record.id },
      data: { bookId: book.id },
    });

    console.log(`✅ "${record.name}" → Libro "${book.name}"`);
  }

  console.log("🎉 Migración completada.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());