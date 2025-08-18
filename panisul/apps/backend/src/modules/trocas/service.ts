import { prisma } from "../../core/prisma";
import { Errors } from "../../core/errors";
import type { CreateExchangeInput } from "@panisul/contracts/v1/trocas";
import type { Prisma } from "@prisma/client";

export async function processExchange(input: CreateExchangeInput) {
	return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
		// Validate input data
		if (!input.outItems || input.outItems.length === 0) {
			throw Errors.validation("Troca deve ter pelo menos um item de saída");
		}

		if (!input.inItems || input.inItems.length === 0) {
			throw Errors.validation("Troca deve ter pelo menos um item de entrada");
		}

		// Validate quantities
		for (const item of input.outItems) {
			if (item.quantity <= 0) {
				throw Errors.validation(`Quantidade de saída deve ser maior que zero para o produto ${item.productId}`);
			}
		}

		for (const item of input.inItems) {
			if (item.quantity <= 0) {
				throw Errors.validation(`Quantidade de entrada deve ser maior que zero para o produto ${item.productId}`);
			}
		}

		// Validate stock for outItems
		for (const item of input.outItems) {
			const product = await tx.product.findUnique({ 
				where: { id: item.productId },
				select: { id: true, name: true, stockQty: true }
			});
			if (!product) throw Errors.validation(`Produto ${item.productId} não encontrado`);
			if (product.stockQty < item.quantity) {
				throw Errors.stockInsufficient(`Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stockQty}, Solicitado: ${item.quantity}`);
			}
		}

		// Apply moves
		for (const item of input.outItems) {
			await tx.product.update({ where: { id: item.productId }, data: { stockQty: { decrement: item.quantity } } });
			await tx.stockMove.create({ data: { productId: item.productId, quantity: -item.quantity, reason: "TROCA" } });
		}
		for (const item of input.inItems) {
			await tx.product.update({ where: { id: item.productId }, data: { stockQty: { increment: item.quantity } } });
			await tx.stockMove.create({ data: { productId: item.productId, quantity: item.quantity, reason: "TROCA" } });
		}

		const exchange = await tx.exchange.create({ 
			data: { 
				clientId: input.clientId, 
				items: { 
					create: [
						...input.inItems.map(i => ({ productId: i.productId, quantity: i.quantity, direction: "IN" as const })),
						...input.outItems.map(i => ({ productId: i.productId, quantity: i.quantity, direction: "OUT" as const })),
					] 
				} 
			} 
		});

		await tx.auditLog.create({
			data: {
				actorId: "system",
				action: "EXCHANGE_PROCESSED",
				entity: "Exchange",
				entityId: exchange.id,
				details: input
			}
		});

		return { id: exchange.id, inCount: input.inItems.length, outCount: input.outItems.length };
	});
}