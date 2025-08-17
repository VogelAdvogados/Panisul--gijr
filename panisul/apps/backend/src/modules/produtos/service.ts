import { prisma } from "../../core/prisma";
import type { produtos } from "@panisul/contracts";

export async function listProducts(): Promise<produtos.Product[]> {
	const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
	return products.map((p) => ({ id: p.id, name: p.name, stockQty: p.stockQty, costAvg: p.costAvg }));
}