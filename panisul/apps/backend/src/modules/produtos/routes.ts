import { Router, type Request, type Response, type NextFunction } from "express";
import { authMiddleware } from "../../core/auth";
import { listProducts } from "./service";
import { makeResponse } from "../../core/apiResponse";

export const productsRouter = Router();

productsRouter.get("/", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const items = await listProducts();
		return res.status(200).json(makeResponse(items, { message: "Produtos", traceId: req.traceId }));
	} catch (err) {
		return next(err);
	}
});