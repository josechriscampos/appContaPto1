import { PrismaClient } from '@prisma/client';

// Creamos una única instancia de PrismaClient y la exportamos
const prisma = new PrismaClient();

export default prisma;
