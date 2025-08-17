import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	const count = await prisma.product.count();
	if (count > 0) {
		console.log("Seed skipped: products already exist");
		return;
	}
	await prisma.product.createMany({
		data: [
			{ name: "Pão Francês (kg)", stockQty: 50, costAvg: 8.5 },
			{ name: "Pão de Queijo (dz)", stockQty: 20, costAvg: 15.0 },
			{ name: "Broa de Milho (un)", stockQty: 40, costAvg: 3.2 },
		]
	});
	console.log("Seed done");
}

main().finally(async () => {
	await prisma.$disconnect();
});