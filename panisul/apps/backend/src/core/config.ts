import { z } from "zod";

const EnvSchema = z.object({
	PORT: z.coerce.number().default(4000),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string().min(1)
});

export type AppConfig = z.infer<typeof EnvSchema>;

export function loadConfig(): AppConfig {
	const parsed = EnvSchema.safeParse(process.env as Record<string, unknown>);
	if (!parsed.success) {
		throw new Error(`Invalid environment: ${parsed.error.message}`);
	}
	return parsed.data;
}