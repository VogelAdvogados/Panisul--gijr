import request from "supertest";
import { app } from "../../../app";
import { prisma } from "../../../core/prisma";
import bcrypt from "bcryptjs";

describe("Auth Module", () => {
	beforeEach(async () => {
		// Clean up test data
		await prisma.user.deleteMany();
	});

	afterAll(async () => {
		await prisma.user.deleteMany();
		await prisma.$disconnect();
	});

	describe("POST /api/v1/auth/register", () => {
		it("should register a new user successfully", async () => {
			const response = await request(app)
				.post("/api/v1/auth/register")
				.send({
					name: "Test User",
					email: "test@example.com",
					password: "password123",
					role: "VENDEDOR"
				});

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
			expect(response.body.data.token).toBeDefined();
			expect(response.body.message).toBe("Usuário registrado");
		});

		it("should not register user with existing email", async () => {
			// Create user first
			await prisma.user.create({
				data: {
					name: "Existing User",
					email: "test@example.com",
					password: await bcrypt.hash("password123", 12),
					role: "VENDEDOR"
				}
			});

			const response = await request(app)
				.post("/api/v1/auth/register")
				.send({
					name: "Test User",
					email: "test@example.com",
					password: "password123",
					role: "VENDEDOR"
				});

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("E-mail já cadastrado");
		});

		it("should validate required fields", async () => {
			const response = await request(app)
				.post("/api/v1/auth/register")
				.send({
					name: "",
					email: "invalid-email",
					password: "123",
					role: "INVALID_ROLE"
				});

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
		});

		it("should validate email format", async () => {
			const response = await request(app)
				.post("/api/v1/auth/register")
				.send({
					name: "Test User",
					email: "invalid-email",
					password: "password123",
					role: "VENDEDOR"
				});

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("E-mail inválido");
		});
	});

	describe("POST /api/v1/auth/login", () => {
		beforeEach(async () => {
			// Create test user
			await prisma.user.create({
				data: {
					name: "Test User",
					email: "test@example.com",
					password: await bcrypt.hash("password123", 12),
					role: "VENDEDOR"
				}
			});
		});

		it("should login successfully with valid credentials", async () => {
			const response = await request(app)
				.post("/api/v1/auth/login")
				.send({
					email: "test@example.com",
					password: "password123"
				});

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.token).toBeDefined();
			expect(response.body.message).toBe("Login efetuado");
		});

		it("should reject login with invalid email", async () => {
			const response = await request(app)
				.post("/api/v1/auth/login")
				.send({
					email: "invalid@example.com",
					password: "password123"
				});

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("Credenciais inválidas");
		});

		it("should reject login with invalid password", async () => {
			const response = await request(app)
				.post("/api/v1/auth/login")
				.send({
					email: "test@example.com",
					password: "wrongpassword"
				});

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("Credenciais inválidas");
		});

		it("should validate email format", async () => {
			const response = await request(app)
				.post("/api/v1/auth/login")
				.send({
					email: "invalid-email",
					password: "password123"
				});

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("E-mail inválido");
		});
	});

	describe("Rate Limiting", () => {
		it("should limit repeated login attempts", async () => {
			// Make multiple rapid requests
			const promises = Array.from({ length: 25 }, () =>
				request(app)
					.post("/api/v1/auth/login")
					.send({
						email: "test@example.com",
						password: "wrongpassword"
					})
			);

			const responses = await Promise.all(promises);
			const rateLimited = responses.some(r => r.status === 429);

			expect(rateLimited).toBe(true);
		});
	});
});