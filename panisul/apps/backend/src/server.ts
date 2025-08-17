import "dotenv/config";
import { app } from "./app";
import { logger } from "./core/logger";

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
	logger.info({ port }, "Backend listening");
});