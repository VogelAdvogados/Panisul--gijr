import { prisma } from "../../core/prisma";
import { Errors } from "../../core/errors";
import type { CreateProductionInput } from "@panisul/contracts/v1/producao";
import type { Prisma } from "@prisma/client";

export async function processProduction(input: CreateProductionInput) {
	return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
		// Validate input data
		if (!input.outputs || input.outputs.length === 0) {
			throw Errors.validation("Produção deve ter pelo menos um produto de saída");
		}

		// Validate quantities
		for (const item of input.outputs) {
			if (item.quantity <= 0) {
				throw Errors.validation(`Quantidade de saída deve ser maior que zero para o produto ${item.productId}`);
			}
		}

		for (const item of input.consumption ?? []) {
			if (item.quantity <= 0) {
				throw Errors.validation(`Quantidade de consumo deve ser maior que zero para o produto ${item.productId}`);
			}
		}

		// Validate consumption first
		for (const item of input.consumption ?? []) {
			const product = await tx.product.findUnique({ 
				where: { id: item.productId },
				select: { id: true, name: true, stockQty: true }
			});
			if (!product) throw Errors.validation(`Produto ${item.productId} não encontrado`);
			if (product.stockQty < item.quantity) {
				throw Errors.stockInsufficient(`Estoque insuficiente para ${product.name}. Disponível: ${product.stockQty}, Necessário: ${item.quantity}`);
			}
		}

		// Apply outputs (increase) and consumption (decrease)
		for (const out of input.outputs) {
			await tx.product.update({ where: { id: out.productId }, data: { stockQty: { increment: out.quantity } } });
			await tx.stockMove.create({ data: { productId: out.productId, quantity: out.quantity, reason: "PRODUCAO" } });
		}
		for (const cons of input.consumption ?? []) {
			await tx.product.update({ where: { id: cons.productId }, data: { stockQty: { decrement: cons.quantity } } });
			await tx.stockMove.create({ data: { productId: cons.productId, quantity: -cons.quantity, reason: "PRODUCAO" } });
		}

		await tx.auditLog.create({ 
			data: { 
				actorId: "system", 
				action: "PRODUCTION_RECORDED", 
				entity: "StockMove", 
				entityId: "-", 
				details: input 
			} 
		});
		return { outputs: input.outputs.length, consumption: input.consumption?.length ?? 0 };
	});
}