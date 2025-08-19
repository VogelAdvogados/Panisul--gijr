import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { makeResponse } from "./apiResponse";

export function validateRequest(schema: ZodSchema) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedData = schema.parse({
				body: req.body,
				query: req.query,
				params: req.params
			});
			
			req.body = validatedData.body;
			req.query = validatedData.query;
			req.params = validatedData.params;
			
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json(
					makeResponse(null, {
						message: "Dados inválidos",
						errors: error.issues.map((issue) => ({
							code: "VALIDACAO.CAMPO_OBRIGATORIO",
							message: issue.message,
							path: issue.path.join(".")
						})),
						traceId: req.traceId,
						success: false
					})
				);
			}
			next(error);
		}
	};
}

export function validateQuery(schema: ZodSchema) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			req.query = schema.parse(req.query);
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json(
					makeResponse(null, {
						message: "Parâmetros de consulta inválidos",
						errors: error.issues.map((issue) => ({
							code: "VALIDACAO.QUERY_INVALIDO",
							message: issue.message,
							path: issue.path.join(".")
						})),
						traceId: req.traceId,
						success: false
					})
				);
			}
			next(error);
		}
	};
}

export function validateParams(schema: ZodSchema) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			req.params = schema.parse(req.params);
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json(
					makeResponse(null, {
						message: "Parâmetros de rota inválidos",
						errors: error.issues.map((issue) => ({
							code: "VALIDACAO.PARAMS_INVALIDO",
							message: issue.message,
							path: issue.path.join(".")
						})),
						traceId: req.traceId,
						success: false
					})
				);
			}
			next(error);
		}
	};
}