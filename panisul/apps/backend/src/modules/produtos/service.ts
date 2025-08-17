import { prisma } from "../../core/prisma";

export async function listProducts() {
	const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
	return products.map((p) => ({ id: p.id, name: p.name, stockQty: p.stockQty, costAvg: p.costAvg }));
}