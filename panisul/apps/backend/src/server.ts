import "dotenv/config";
import { app } from "./app";
import { logger } from "./core/logger";
import { loadConfig } from "./core/config";

const cfg = loadConfig();

app.listen(cfg.PORT, () => {
	logger.info({ port: cfg.PORT, env: cfg.NODE_ENV }, "Backend listening");
});