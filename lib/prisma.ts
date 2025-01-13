import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Type the events
prisma.$on('error' as never, (e) => {
  console.error('Prisma Client error:', e);
}) as unknown;

prisma.$on('warn' as never, (e) => {
  console.warn('Prisma Client warning:', e);
}) as unknown;

prisma.$on('query' as never, (e) => {
  console.log('Query:', e);
}) as unknown;

export default prisma;