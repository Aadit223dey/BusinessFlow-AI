import { z } from "zod";

/**
 * Environment Variable Validation Engine
 *
 * Reads environment data keys from system contexts on server initialization,
 * runs schema format checks using Zod, and stops execution with an explicit
 * error console log if values are missing or malformed.
 */

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({
      required_error: "NEXT_PUBLIC_SUPABASE_URL is required",
    })
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string({
      required_error: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required",
    })
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY must not be empty"),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!result.success) {
    const formatted = result.error.flatten().fieldErrors;
    console.error(
      "\n❌ [ENV VALIDATION FAILURE] Invalid environment variables detected:\n",
      JSON.stringify(formatted, null, 2),
      "\n\nPlease configure the required environment variables before starting the application.\n"
    );
    throw new Error("Environment validation failed. See console output above.");
  }

  return Object.freeze(result.data);
}

/**
 * Immutable, type-checked environment configuration.
 * Access validated environment variables through this export.
 *
 * @example
 * ```ts
 * import { env } from "@/config/env";
 * console.log(env.NEXT_PUBLIC_SUPABASE_URL);
 * ```
 */
export const env: Env = validateEnv();
