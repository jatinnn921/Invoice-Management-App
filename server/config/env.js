import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  REPLIT_DEV_DOMAIN: z.string().optional(),
  REPLIT_DOMAINS: z.string().optional(),
});

export const env = envSchema.parse(process.env);