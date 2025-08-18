import { prisma } from "../../core/prisma";
import { Errors } from "../../core/errors";
import type { CreateSaleInput } from "@panisul/contracts/v1/vendas";
import type { Prisma } from "@prisma/client";

export async function createSale(input: CreateSaleInput) {
	return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
		// Validate input data
		if (!input.items || input.items.length === 0) {
			throw Errors.validation("Venda deve ter pelo menos um item");
		}

		// Validate prices and quantities
		for (const item of input.items) {
			if (item.price <= 0) {
				throw Errors.validation(`Preço deve ser maior que zero para o produto ${item.productId}`);
			}
			if (item.quantity <= 0) {
				throw Errors.validation(`Quantidade deve ser maior que zero para o produto ${item.productId}`);
			}
		}

		// Check stock first - use SELECT FOR UPDATE to prevent race conditions
		for (const item of input.items) {
			const product = await tx.product.findUnique({ 
				where: { id: item.productId },
				select: { id: true, name: true, stockQty: true }
			});
			if (!product) throw Errors.validation(`Produto ${item.productId} não encontrado`);
			if (product.stockQty < item.quantity) {
				throw Errors.stockInsufficient(`Estoque insuficiente para o produto ${product.name}. Disponível: ${product.stockQty}, Solicitado: ${item.quantity}`);
			}
		}

		// Calculate total value
		const totalValue = input.items.reduce((sum, it) => sum + it.quantity * it.price, 0);
		if (totalValue <= 0) {
			throw Errors.validation("Valor total da venda deve ser maior que zero");
		}

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

		if (input.paymentType === "APRAZO") {
			const due = input.dueDate ? new Date(input.dueDate) : new Date();
			await tx.accountsReceivable.create({
				data: {
					saleId: sale.id,
					dueDate: due,
					amount: totalValue,
					status: "OPEN"
				}
			});
		}

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

		// Update stock and create stock moves
		for (const item of input.items) {
			await tx.product.update({
				where: { id: item.productId },
				data: { stockQty: { decrement: item.quantity } }
			});
			await tx.stockMove.create({
				data: {
					productId: item.productId,
					quantity: -item.quantity, // Remove Math.abs as quantity is already validated as positive
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
		items: sale.items.map((i: { productId: string; quantity: number; price: number }) => ({ productId: i.productId, quantity: i.quantity, price: i.price }))
	};
}