import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const url = new URL(process.env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.slice(1)),
  connectionLimit: Number(
    process.env.DB_CONNECTION_LIMIT || (process.env.VERCEL ? 3 : 10),
  ),
  connectTimeout: 10000,
  ...(process.env.DB_SSL === "true" ? { ssl: true } : {}),
});
export const prisma = new PrismaClient({ adapter });
