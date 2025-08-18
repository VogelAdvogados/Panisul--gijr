import { Router, type Request, type Response, type NextFunction } from "express";
import { authMiddleware, requireRoles } from "../../core/auth";
import { makeResponse } from "../../core/apiResponse";
import { CreateClientDTO } from "@panisul/contracts/v1/clients";
import { prisma } from "../../core/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const clientesRouter = Router();

clientesRouter.get("/", authMiddleware, requireRoles("ADMIN", "VENDEDOR"), async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { q, page, pageSize } = z.object({
			q: z.string().optional(),
			page: z.coerce.number().min(1).optional().default(1),
			pageSize: z.coerce.number().min(1).max(100).optional().default(10)
		}).parse(req.query);

		const where: Prisma.ClientWhereInput = q
			? {
				OR: [
					{ name: { contains: q, mode: Prisma.QueryMode.insensitive } },
					{ phone: { contains: q, mode: Prisma.QueryMode.insensitive } },
					{ email: { contains: q, mode: Prisma.QueryMode.insensitive } }
				]
			}
			: {};

		const [total, rows] = await Promise.all([
			prisma.client.count({ where }),
			prisma.client.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize })
		]);
		const items = rows.map((c: any) => ({ id: c.id, name: c.name, email: c.email ?? null, phone: c.phone, createdAt: c.createdAt.toISOString() }));
		const totalPages = Math.ceil(total / pageSize);
		return res.status(200).json(makeResponse({ items, total, page, pageSize, totalPages }, { message: "Clientes", traceId: res.req.traceId }));
	} catch (err) {
		return next(err);
	}
});

clientesRouter.post("/", authMiddleware, requireRoles("ADMIN", "VENDEDOR"), async (req: Request, res: Response, next: NextFunction) => {
	try {
		const input = CreateClientDTO.parse(req.body);
		const created = await prisma.client.create({ data: { name: input.name, email: input.email, phone: input.phone } });
		return res.status(201).json(makeResponse({ id: created.id, name: created.name, email: created.email ?? null, phone: created.phone, createdAt: created.createdAt.toISOString() }, { message: "Cliente criado", traceId: req.traceId }));
	} catch (err) {
		return next(err);
	}
});

clientesRouter.put("/:id", authMiddleware, requireRoles("ADMIN", "VENDEDOR"), async (req: Request, res: Response, next: NextFunction) => {
	try {
		const params = z.object({ id: z.string().uuid() }).parse(req.params);
		const body = z.object({ name: z.string().min(1), phone: z.string().min(1), email: z.string().email().optional().nullable() }).parse(req.body);
		const updated = await prisma.client.update({ where: { id: params.id }, data: { name: body.name, phone: body.phone, email: body.email ?? undefined } });
		return res.status(200).json(makeResponse({ id: updated.id, name: updated.name, email: updated.email ?? null, phone: updated.phone, createdAt: updated.createdAt.toISOString() }, { message: "Cliente atualizado", traceId: req.traceId }));
	} catch (err) {
		return next(err);
	}
});

clientesRouter.delete("/:id", authMiddleware, requireRoles("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
		await prisma.client.delete({ where: { id } });
		return res.status(200).json(makeResponse({ id }, { message: "Cliente removido", traceId: req.traceId }));
	} catch (err) {
		return next(err);
	}
});

clientesRouter.get("/:id", authMiddleware, requireRoles("ADMIN", "VENDEDOR"), async (req, res, next) => {
	try {
		const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
		const c = await prisma.client.findUnique({ where: { id } });
		if (!c) return res.status(404).json(makeResponse(null, { message: "Cliente não encontrado", traceId: req.traceId, success: false }));
		return res.status(200).json(makeResponse({ id: c.id, name: c.name, email: c.email ?? null, phone: c.phone, createdAt: c.createdAt.toISOString() }, { message: "Cliente", traceId: req.traceId }));
	} catch (err) {
		return next(err);
	}
});

clientesRouter.get("/:id/receivables", authMiddleware, requireRoles("ADMIN", "VENDEDOR"), async (req, res, next) => {
	try {
		const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
		const list = await prisma.accountsReceivable.findMany({
			where: { Sale: { clientId: id }, status: "OPEN" },
			orderBy: { dueDate: "asc" },
			include: { Sale: true }
		});
		return res.status(200).json(makeResponse(list.map((r: any) => ({ id: r.id, dueDate: r.dueDate.toISOString(), amount: r.amount, status: r.status, saleId: r.saleId })), { message: "Recebíveis", traceId: req.traceId }));
	} catch (err) {
		return next(err);
	}
});

clientesRouter.get("/:id/sales", authMiddleware, requireRoles("ADMIN", "VENDEDOR"), async (req, res, next) => {
	try {
		const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
		const sales = await prisma.sale.findMany({ where: { clientId: id }, orderBy: { createdAt: "desc" } });
		return res.status(200).json(makeResponse(sales.map((s: any) => ({ id: s.id, createdAt: s.createdAt.toISOString(), totalValue: s.totalValue, paymentType: s.paymentType })), { message: "Histórico de compras", traceId: req.traceId }));
	} catch (err) {
		return next(err);
	}
});

clientesRouter.get("/:id/exchanges", authMiddleware, requireRoles("ADMIN", "VENDEDOR"), async (req, res, next) => {
	try {
		const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
		const exchanges = await prisma.exchange.findMany({ where: { clientId: id }, orderBy: { createdAt: "desc" }, include: { items: true } });
		return res.status(200).json(makeResponse(exchanges.map((e: any) => ({ id: e.id, createdAt: e.createdAt.toISOString(), items: e.items })), { message: "Histórico de trocas", traceId: req.traceId }));
	} catch (err) {
		return next(err);
	}
});