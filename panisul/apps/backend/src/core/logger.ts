import pino from "pino";

export const logger = pino({
	level: process.env.NODE_ENV === "production" ? "info" : "debug",
	base: undefined,
	formatters: {
		level(label) {
			return { level: label };
		}
	}
});