import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

export const prisma = new PrismaClient({
	log: [{ emit: "event", level: "query" }, "error", "warn"],
});

// Log Prisma queries in development for observability
prisma.$on("query", (event) => {
	// Only log verbose query details outside production
	if (process.env.NODE_ENV !== "production") {
		logger.debug(
			{ query: event.query, params: event.params, durationMs: event.duration },
			"Prisma query executed"
		);
	}
});