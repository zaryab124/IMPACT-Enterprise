import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3005),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  GEMINI_API_KEY: z.string().optional(),
  SESSION_SECRET: z.string().min(16).default("impact-development-session-secret-change-in-prod"),
  JWT_SECRET: z.string().min(16).default("impact-development-jwt-secret-change-in-prod"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment configuration:", result.error.format());
    // In development/test, provide defaults rather than immediately crashing
    if (process.env.NODE_ENV !== "production") {
      return envSchema.parse({
        NODE_ENV: process.env.NODE_ENV || "development",
        PORT: process.env.PORT ? Number(process.env.PORT) : 3005,
      });
    }
    throw new Error("Missing or invalid required environment variables.");
  }
  return result.data;
}

export const env = parseEnv();
