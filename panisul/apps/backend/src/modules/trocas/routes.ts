import { Router, type Request, type Response, type NextFunction } from "express";
import { authMiddleware, requireRoles } from "../../core/auth";
import { makeResponse } from "../../core/apiResponse";
import { CreateExchangeDTO } from "@panisul/contracts/v1/trocas";
import { processExchange } from "./service";

export const trocasRouter = Router();

trocasRouter.post("/", authMiddleware, requireRoles("ADMIN", "VENDEDOR"), async (req: Request, res: Response, next: NextFunction) => {
	try {
		const input = CreateExchangeDTO.parse(req.body);
		const result = await processExchange(input);
		return res.status(201).json(makeResponse(result, { message: "Troca registrada", traceId: req.traceId }));
	} catch (err) {
		return next(err);
	}
});