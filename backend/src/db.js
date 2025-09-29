import { PrismaClient } from '@prisma/client';

// 1. Creamos la instancia del cliente de Prisma
export const prisma = new PrismaClient();

// 2. Creamos y exportamos la función para conectar a la base de datos
export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database is connected");
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
    process.exit(1); // Si no se puede conectar, detenemos la app
  }
};