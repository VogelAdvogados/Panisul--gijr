import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	const prodCount = await prisma.product.count();
	if (prodCount === 0) {
		await prisma.product.createMany({
			data: [
				{ name: "Pão Francês (kg)", stockQty: 50, costAvg: 8.5 },
				{ name: "Pão de Queijo (dz)", stockQty: 20, costAvg: 15.0 },
				{ name: "Broa de Milho (un)", stockQty: 40, costAvg: 3.2 },
			]
		});
		console.log("Seed: products created");
	}

	const adminEmail = "admin@panisul.local";
	const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
	if (!admin) {
		const hash = await bcrypt.hash("admin123", 10);
		await prisma.user.create({ data: { name: "Admin", email: adminEmail, password: hash, role: "ADMIN" } });
		console.log("Seed: admin user created (admin@panisul.local / admin123)");
	}
}

main().finally(async () => {
	await prisma.$disconnect();
});