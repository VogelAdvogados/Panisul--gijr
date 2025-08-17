import { Router, type Request, type Response, type NextFunction } from "express";
import { authMiddleware, requireRoles } from "../../../core/auth";
import { prisma } from "../../../core/prisma";
import { makeResponse } from "../../../core/apiResponse";

export const recebiveisRouter = Router();

recebiveisRouter.get("/", authMiddleware, requireRoles("ADMIN", "VENDEDOR"), async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const list = await prisma.accountsReceivable.findMany({ where: { status: "OPEN" }, orderBy: { dueDate: "asc" } });
		return res.status(200).json(makeResponse(list, { message: "Recebíveis em aberto", traceId: res.req.traceId }));
	} catch (err) {
		return next(err);
	}
});

recebiveisRouter.post("/:id/baixa", authMiddleware, requireRoles("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id;
		const updated = await prisma.accountsReceivable.update({ where: { id }, data: { status: "PAID" } });
		return res.status(200).json(makeResponse(updated, { message: "Recebível baixado", traceId: req.traceId }));
	} catch (err) {
		return next(err);
	}
});