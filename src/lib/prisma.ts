import { PrismaClient } from '@prisma/client';

// Declare global type for Prisma Client
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma Client instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// In development, save the instance to global to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export default as well for flexibility
export default prisma;