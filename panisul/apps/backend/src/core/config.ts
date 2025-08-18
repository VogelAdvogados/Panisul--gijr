import { z } from "zod";

const EnvSchema = z.object({
	PORT: z.coerce.number().default(4000),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	DATABASE_URL: z.string().url().default("postgresql://test:test@localhost:5432/test"),
	JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter pelo menos 32 caracteres").default("test-secret-key-with-at-least-32-characters"),
	JWT_EXPIRES_IN: z.string().default("7d"),
	CORS_ORIGINS: z.string().default("*"),
	LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info")
});

export type AppConfig = z.infer<typeof EnvSchema>;

export function loadConfig(): AppConfig {
	const parsed = EnvSchema.safeParse(process.env as Record<string, unknown>);
	if (!parsed.success) {
		throw new Error(`Invalid environment: ${parsed.error.message}`);
	}
	return parsed.data;
}