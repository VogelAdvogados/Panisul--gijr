import { Router, type Request, type Response, type NextFunction } from "express";
import { authMiddleware, requireRoles } from "../../core/auth";
import { makeResponse } from "../../core/apiResponse";
import { CreateProductionDTO } from "@panisul/contracts/v1/producao";
import { processProduction } from "./service";

export const producaoRouter = Router();

producaoRouter.post("/", authMiddleware, requireRoles("ADMIN", "PRODUCAO"), async (req: Request, res: Response, next: NextFunction) => {
	try {
		const input = CreateProductionDTO.parse(req.body);
		const result = await processProduction(input);
		return res.status(201).json(makeResponse(result, { message: "Produção registrada", traceId: req.traceId }));
	} catch (err) {
		return next(err);
	}
});