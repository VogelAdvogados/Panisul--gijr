import { prisma } from "../../core/prisma";
import { Errors } from "../../core/errors";
import type { CreateProductionInput } from "@panisul/contracts/v1/producao";
import type { Prisma } from "@prisma/client";

export async function processProduction(input: CreateProductionInput) {
	return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
		// Validate consumption first
		for (const item of input.consumption ?? []) {
			const product = await tx.product.findUnique({ where: { id: item.productId } });
			if (!product) throw Errors.validation(`Produto ${item.productId} não encontrado`);
			if (product.stockQty - item.quantity < 0) throw Errors.stockInsufficient(`Estoque insuficiente para ${product.name}`);
		}

		// Apply outputs (increase) and consumption (decrease)
		for (const out of input.outputs) {
			await tx.product.update({ where: { id: out.productId }, data: { stockQty: { increment: out.quantity } } });
			await tx.stockMove.create({ data: { productId: out.productId, quantity: Math.abs(out.quantity), reason: "PRODUCAO" } });
		}
		for (const cons of input.consumption ?? []) {
			await tx.product.update({ where: { id: cons.productId }, data: { stockQty: { decrement: cons.quantity } } });
			await tx.stockMove.create({ data: { productId: cons.productId, quantity: -Math.abs(cons.quantity), reason: "PRODUCAO" } });
		}

		await tx.auditLog.create({ data: { actorId: "system", action: "PRODUCTION_RECORDED", entity: "StockMove", entityId: "-", details: input } });
		return { outputs: input.outputs.length, consumption: input.consumption?.length ?? 0 };
	});
}