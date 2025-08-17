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

export const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(attachTraceId);
app.use(
	pinoHttp({
		logger,
		customProps: (req) => ({ traceId: req.traceId })
	})
);

app.get("/api/v1/health", (req, res) => {
	return res.status(200).json(
		makeResponse({ status: "ok" }, { message: "healthy", traceId: req.traceId, success: true })
	);
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/sales", vendasRouter);

// Not found handler
app.use((req, res) => {
	return res.status(404).json(makeResponse(null, { message: "Not Found", traceId: req.traceId, success: false }));
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
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
			errors: [{ code: "VALIDACAO.CAMPO_OBRIGATORIO", message: "Erro interno do servidor" }],
			traceId: req.traceId,
			success: false
		})
	);
});