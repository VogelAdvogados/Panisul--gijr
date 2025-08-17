import { Router, type Request, type Response, type NextFunction } from "express";
import { authMiddleware, requireRoles } from "../../core/auth";
import { makeResponse } from "../../core/apiResponse";
import { CreateClientDTO } from "@panisul/contracts/v1/clients";
import { prisma } from "../../core/prisma";

export const clientesRouter = Router();

clientesRouter.get("/", authMiddleware, requireRoles("ADMIN", "VENDEDOR"), async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const list = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
		return res.status(200).json(makeResponse(list.map(c => ({ id: c.id, name: c.name, email: c.email ?? null, phone: c.phone ?? null, createdAt: c.createdAt.toISOString() })), { message: "Clientes", traceId: res.req.traceId }));
	} catch (err) {
		return next(err);
	}
});

clientesRouter.post("/", authMiddleware, requireRoles("ADMIN", "VENDEDOR"), async (req: Request, res: Response, next: NextFunction) => {
	try {
		const input = CreateClientDTO.parse(req.body);
		const created = await prisma.client.create({ data: { name: input.name, email: input.email, phone: input.phone } });
		return res.status(201).json(makeResponse({ id: created.id, name: created.name, email: created.email ?? null, phone: created.phone ?? null, createdAt: created.createdAt.toISOString() }, { message: "Cliente criado", traceId: req.traceId }));
	} catch (err) {
		return next(err);
	}
});