import request from "supertest";
import { app } from "../../../app";
import { prisma } from "../../../core/prisma";
import jwt from "jsonwebtoken";
import { loadConfig } from "../../../core/config";

describe("Vendas Module", () => {
	let authToken: string;
	let clientId: string;
	let productId: string;

	const config = loadConfig();

	beforeAll(async () => {
		// Create test user and get token
		const user = await prisma.user.create({
			data: {
				name: "Test User",
				email: "test@example.com",
				password: "hashedpassword",
				role: "VENDEDOR"
			}
		});

		authToken = jwt.sign(
			{ id: user.id, role: user.role as "ADMIN" | "VENDEDOR" | "PRODUCAO" },
			config.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		// Create test client
		const client = await prisma.client.create({
			data: {
				name: "Test Client",
				phone: "123456789",
				email: "client@example.com"
			}
		});
		clientId = client.id;

		// Create test product
		const product = await prisma.product.create({
			data: {
				name: "Test Product",
				stockQty: 100,
				costAvg: 10.0
			}
		});
		productId = product.id;
	});

	beforeEach(async () => {
		// Clean up sales and related data before each test
		await prisma.accountsReceivable.deleteMany();
		await prisma.saleItem.deleteMany();
		await prisma.sale.deleteMany();
		await prisma.stockMove.deleteMany();

		// Reset product stock
		await prisma.product.update({
			where: { id: productId },
			data: { stockQty: 100 }
		});
	});

	afterAll(async () => {
		await prisma.accountsReceivable.deleteMany();
		await prisma.saleItem.deleteMany();
		await prisma.sale.deleteMany();
		await prisma.stockMove.deleteMany();
		await prisma.client.deleteMany();
		await prisma.product.deleteMany();
		await prisma.user.deleteMany();
		await prisma.$disconnect();
	});

	describe("POST /api/v1/sales", () => {
		it("should create a sale with cash payment successfully", async () => {
			const saleData = {
				clientId,
				paymentType: "AVISTA",
				items: [
					{
						productId,
						quantity: 5,
						price: 15.0
					}
				]
			};

			const response = await request(app)
				.post("/api/v1/sales")
				.set("Authorization", `Bearer ${authToken}`)
				.send(saleData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data.id).toBeDefined();
			expect(response.body.data.totalValue).toBe(75.0);
			expect(response.body.data.paymentType).toBe("AVISTA");

			// Verify stock was reduced
			const product = await prisma.product.findUnique({
				where: { id: productId }
			});
			expect(product?.stockQty).toBe(95);

			// Verify stock move was created
			const stockMove = await prisma.stockMove.findFirst({
				where: { productId, reason: "VENDA" }
			});
			expect(stockMove).toBeDefined();
			expect(stockMove?.quantity).toBe(-5);
		});

		it("should create a sale with credit payment and receivable", async () => {
			const dueDate = new Date();
			dueDate.setDate(dueDate.getDate() + 30);

			const saleData = {
				clientId,
				paymentType: "APRAZO",
				dueDate: dueDate.toISOString(),
				items: [
					{
						productId,
						quantity: 3,
						price: 20.0
					}
				]
			};

			const response = await request(app)
				.post("/api/v1/sales")
				.set("Authorization", `Bearer ${authToken}`)
				.send(saleData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data.paymentType).toBe("APRAZO");

			// Verify receivable was created
			const receivable = await prisma.accountsReceivable.findFirst({
				where: { saleId: response.body.data.id }
			});
			expect(receivable).toBeDefined();
			expect(receivable?.amount).toBe(60.0);
			expect(receivable?.status).toBe("OPEN");
		});

		it("should reject sale with insufficient stock", async () => {
			const saleData = {
				clientId,
				paymentType: "AVISTA",
				items: [
					{
						productId,
						quantity: 150, // More than available stock
						price: 15.0
					}
				]
			};

			const response = await request(app)
				.post("/api/v1/sales")
				.set("Authorization", `Bearer ${authToken}`)
				.send(saleData)
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toContain("Estoque insuficiente");
		});

		it("should reject sale with invalid product", async () => {
			const saleData = {
				clientId,
				paymentType: "AVISTA",
				items: [
					{
						productId: "invalid-product-id",
						quantity: 5,
						price: 15.0
					}
				]
			};

			const response = await request(app)
				.post("/api/v1/sales")
				.set("Authorization", `Bearer ${authToken}`)
				.send(saleData)
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toContain("não encontrado");
		});

		it("should require authentication", async () => {
			const saleData = {
				clientId,
				paymentType: "AVISTA",
				items: [
					{
						productId,
						quantity: 5,
						price: 15.0
					}
				]
			};

			await request(app)
				.post("/api/v1/sales")
				.send(saleData)
				.expect(401);
		});
	});

	describe("GET /api/v1/sales/:id", () => {
		it("should get sale by id", async () => {
			// Create a sale first
			const sale = await prisma.sale.create({
				data: {
					clientId,
					totalValue: 50.0,
					paymentType: "AVISTA",
					items: {
						create: [
							{
								productId,
								quantity: 2,
								price: 25.0
							}
						]
					}
				}
			});

			const response = await request(app)
				.get(`/api/v1/sales/${sale.id}`)
				.set("Authorization", `Bearer ${authToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.id).toBe(sale.id);
			expect(response.body.data.items).toHaveLength(1);
		});

		it("should return 404 for non-existent sale", async () => {
			await request(app)
				.get("/api/v1/sales/non-existent-id")
				.set("Authorization", `Bearer ${authToken}`)
				.expect(404);
		});
	});
});