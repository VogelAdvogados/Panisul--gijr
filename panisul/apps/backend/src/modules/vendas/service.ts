import { prisma } from "../../core/prisma";
import { Errors } from "../../core/errors";
import type { CreateSaleInput } from "@panisul/contracts/v1/vendas";

export async function createSale(input: CreateSaleInput) {
	return await prisma.$transaction(async (tx) => {
		// Check stock first
		for (const item of input.items) {
			const product = await tx.product.findUnique({ where: { id: item.productId } });
			if (!product) throw Errors.validation(`Produto ${item.productId} não encontrado`);
			if (product.stockQty - item.quantity < 0) {
				throw Errors.stockInsufficient(`Estoque insuficiente para o produto ${product.name}`);
			}
		}

		// Apply stock changes and create sale and moves
		const totalValue = input.items.reduce((sum, it) => sum + it.quantity * it.price, 0);

		const sale = await tx.sale.create({
			data: {
				clientId: input.clientId,
				totalValue,
				paymentType: input.paymentType,
				dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
				items: {
					create: input.items.map((it) => ({ productId: it.productId, quantity: it.quantity, price: it.price }))
				}
			}
		});

		await tx.auditLog.create({
			data: {
				actorId: "system",
				action: "SALE_CREATED",
				entity: "Sale",
				entityId: sale.id,
				details: {
					clientId: input.clientId,
					totalValue,
					items: input.items
				}
			}
		});

		for (const item of input.items) {
			await tx.product.update({
				where: { id: item.productId },
				data: { stockQty: { decrement: item.quantity } }
			});
			await tx.stockMove.create({
				data: {
					productId: item.productId,
					quantity: -Math.abs(item.quantity),
					reason: "VENDA"
				}
			});
		}

		return {
			id: sale.id,
			createdAt: sale.createdAt.toISOString(),
			clientId: sale.clientId,
			totalValue: sale.totalValue,
			paymentType: sale.paymentType,
			dueDate: sale.dueDate ? sale.dueDate.toISOString() : null
		};
	});
}

export async function getSaleById(id: string) {
	const sale = await prisma.sale.findUnique({
		where: { id },
		include: { items: true }
	});
	if (!sale) throw Errors.validation("Venda não encontrada");
	return {
		id: sale.id,
		createdAt: sale.createdAt.toISOString(),
		clientId: sale.clientId,
		totalValue: sale.totalValue,
		paymentType: sale.paymentType,
		dueDate: sale.dueDate ? sale.dueDate.toISOString() : null,
		items: sale.items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price }))
	};
}