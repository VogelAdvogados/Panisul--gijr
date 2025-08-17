import { prisma } from "../../core/prisma";
import { Errors } from "../../core/errors";
import type { CreateExchangeInput } from "@panisul/contracts/v1/trocas";

export async function processExchange(input: CreateExchangeInput) {
	return await prisma.$transaction(async (tx) => {
		// Validate stock for outItems
		for (const item of input.outItems) {
			const product = await tx.product.findUnique({ where: { id: item.productId } });
			if (!product) throw Errors.validation(`Produto ${item.productId} não encontrado`);
			if (product.stockQty - item.quantity < 0) {
				throw Errors.stockInsufficient(`Estoque insuficiente para o produto ${product.name}`);
			}
		}

		// Apply moves
		for (const item of input.outItems) {
			await tx.product.update({ where: { id: item.productId }, data: { stockQty: { decrement: item.quantity } } });
			await tx.stockMove.create({ data: { productId: item.productId, quantity: -Math.abs(item.quantity), reason: "TROCA" } as any });
		}
		for (const item of input.inItems) {
			await tx.product.update({ where: { id: item.productId }, data: { stockQty: { increment: item.quantity } } });
			await tx.stockMove.create({ data: { productId: item.productId, quantity: Math.abs(item.quantity), reason: "TROCA" } as any });
		}

		await tx.auditLog.create({
			data: {
				actorId: "system",
				action: "EXCHANGE_PROCESSED",
				entity: "StockMove",
				entityId: "-",
				details: input
			}
		});

		return { inCount: input.inItems.length, outCount: input.outItems.length };
	});
}