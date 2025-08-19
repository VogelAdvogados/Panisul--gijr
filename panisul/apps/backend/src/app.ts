import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { logger } from "./core/logger";
import { attachTraceId } from "./core/requestContext";
import { makeResponse } from "./core/apiResponse";
import { AppError } from "./core/errors";
import { vendasRouter } from "./modules/vendas/routes";
import { authRouter } from "./modules/auth/routes";
import { attachResponseTraceHeader } from "./core/responseHeaders";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import { ZodError } from "zod";
import { productsRouter } from "./modules/produtos/routes";
import { clientesRouter } from "./modules/clientes/routes";
import { recebiveisRouter } from "./modules/financeiro/recebiveis/routes";
import { trocasRouter } from "./modules/trocas/routes";
import { producaoRouter } from "./modules/producao/routes";
import { loadConfig } from "./core/config";

const config = loadConfig();

export const app = express();

app.use(helmet());
app.use(cors({ 
	origin: config.CORS_ORIGINS === "*" ? true : config.CORS_ORIGINS.split(","),
	credentials: true 
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(attachTraceId);
app.use(attachResponseTraceHeader);
app.use(
	pinoHttp({
		customProps: (req) => ({ traceId: req.traceId })
	})
);

// Swagger UI for OpenAPI v1 - only load in non-test environment
if (process.env.NODE_ENV !== "test") {
	try {
		const openapiPath = path.resolve(process.cwd(), "docs/openapi-v1.yaml");
		const openapiDoc = YAML.parse(fs.readFileSync(openapiPath, "utf-8"));
		app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc));
	} catch {
		logger.warn("Could not load OpenAPI docs");
	}
}

app.get("/api/v1/health", (req, res) => {
	return res.status(200).json(
		makeResponse({ status: "ok" }, { message: "healthy", traceId: req.traceId, success: true })
	);
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/clients", clientesRouter);
app.use("/api/v1/receivables", recebiveisRouter);
app.use("/api/v1/exchanges", trocasRouter);
app.use("/api/v1/production", producaoRouter);
app.use("/api/v1/sales", vendasRouter);

// Not found handler
app.use((req, res) => {
	return res.status(404).json(makeResponse(null, { message: "Not Found", traceId: req.traceId, success: false }));
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
	if (err instanceof ZodError) {
		return res.status(400).json(
			makeResponse(null, {
				message: "Dados inválidos",
				errors: err.issues.map((i) => ({ code: "VALIDACAO.CAMPO_OBRIGATORIO", message: i.message })),
				traceId: req.traceId,
				success: false
			})
		);
	}
	if (err instanceof AppError) {
		return res.status(err.status).json(
			makeResponse(null, {
				message: err.message,
				errors: [{ code: err.code, message: err.message }],
				traceId: req.traceId,
				success: false
			})
		);
	}
	logger.error({ err, traceId: req.traceId }, "Unhandled error");
	return res.status(500).json(
		makeResponse(null, {
			message: "Erro interno do servidor",
			traceId: req.traceId,
			success: false
		})
	);
});