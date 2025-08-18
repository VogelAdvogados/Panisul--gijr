import { prisma } from "../../core/prisma";
import type { produtos } from "@panisul/contracts";

export async function listProducts(): Promise<produtos.Product[]> {
	const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
	return products.map((product: { id: string; name: string; stockQty: number; costAvg: number }) => ({ id: product.id, name: product.name, stockQty: product.stockQty, costAvg: product.costAvg }));
}