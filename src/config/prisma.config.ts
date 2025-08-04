import { registerAs } from '@nestjs/config';

export default registerAs('prisma', () => ({
  databaseUrl: process.env.DATABASE_URL || '',
  logQueries: process.env.NODE_ENV === 'development',
  logSlowQueries: parseInt(process.env.LOG_SLOW_QUERIES || '1000', 10),
  connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10', 10),
})); 