import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

// A URL do seu banco de dados .db (já deve estar no seu arquivo .env)
const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

// Cria a instância do adaptador, passando a URL do banco
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

// Cria o cliente Prisma, passando o adaptador como parâmetro
const prisma = new PrismaClient({ adapter });

export default prisma;