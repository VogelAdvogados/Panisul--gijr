import "dotenv/config";
import { app } from "./app";
import { logger } from "./core/logger";
import { loadConfig } from "./core/config";
import { prisma } from "./core/prisma";

const cfg = loadConfig();

const server = app.listen(cfg.PORT, () => {
	logger.info({ port: cfg.PORT, env: cfg.NODE_ENV }, "Backend listening");
});

async function shutdown(signal: string) {
	logger.info({ signal }, "Shutting down gracefully");
	server.close(async (err?: Error) => {
		if (err) {
			logger.error({ err }, "Error closing HTTP server");
		}
		try {
			await prisma.$disconnect();
		} catch (e) {
			logger.error({ err: e }, "Error disconnecting Prisma");
		} finally {
			process.exit(err ? 1 : 0);
		}
	});
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException", (err) => {
	logger.fatal({ err }, "Uncaught exception");
	shutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
	logger.fatal({ reason }, "Unhandled rejection");
	shutdown("unhandledRejection");
});