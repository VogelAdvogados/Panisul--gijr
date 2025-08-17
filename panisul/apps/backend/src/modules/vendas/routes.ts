import { Router, type Request, type Response, type NextFunction } from "express";
import { authMiddleware, requireRoles } from "../../core/auth";
import { CreateSaleDTO } from "@panisul/contracts/v1/vendas";
import { makeResponse } from "../../core/apiResponse";
import { createSale } from "./service";

export const vendasRouter = Router();

vendasRouter.post("/", authMiddleware, requireRoles("ADMIN", "VENDEDOR"), async (req: Request, res: Response, next: NextFunction) => {
	try {
		const input = CreateSaleDTO.parse(req.body);
		const result = await createSale(input);
		return res.status(201).json(makeResponse(result, { message: "Venda registrada com sucesso", traceId: req.traceId }));
	} catch (err) {
		return next(err);
	}
});