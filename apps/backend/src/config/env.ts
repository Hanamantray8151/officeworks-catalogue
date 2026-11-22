import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from apps/api/.env
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  API_PORT: z.coerce.number().int().positive().default(4000),

  PRODUCT_API_BASE_URL: z.string().url().default("https://fakestoreapi.com"),

  SMTP_HOST: z.string().default("localhost"),

  SMTP_PORT: z.coerce.number().int().positive().default(1025),

  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value: string) => value === "true"),

  SMTP_USER: z.string().default(""),

  SMTP_PASSWORD: z.string().default(""),

  SALES_INBOX_EMAIL: z.string().email().default("sales@example.com"),

  EMAIL_FROM: z
    .string()
    .min(1)
    .default("Catalogue Enquiries <no-reply@example.com>"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const errorDetails = parsedEnv.error.issues
    .map((issue: { path: any[]; message: any; }) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment configuration:\n${errorDetails}`);
}

export const env = parsedEnv.data;
