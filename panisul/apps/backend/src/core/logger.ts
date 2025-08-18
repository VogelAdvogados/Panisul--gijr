import pino from "pino";
import { loadConfig } from "./config";

const config = loadConfig();

const transport = config.NODE_ENV === "development" 
	? pino.transport({
		target: "pino-pretty",
		options: {
			colorize: true,
			translateTime: "SYS:standard",
			ignore: "pid,hostname"
		}
	})
	: undefined;

export const logger = pino({
	level: config.LOG_LEVEL,
	base: undefined,
	formatters: {
		level(label) {
			return { level: label };
		}
	}
}, transport);