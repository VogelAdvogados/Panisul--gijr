import request from "supertest";
import { app } from "../../../app";
import { prisma } from "../../../core/prisma";
import bcrypt from "bcryptjs";

describe("Auth Module", () => {
	beforeEach(async () => {
		await prisma.user.deleteMany();
	});

	afterAll(async () => {
		await prisma.user.deleteMany();
		await prisma.$disconnect();
	});

	describe("POST /api/v1/auth/register", () => {
		it("should register a new user successfully", async () => {
			const userData = {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
				role: "VENDEDOR"
			};

			const response = await request(app)
				.post("/api/v1/auth/register")
				.send(userData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data.token).toBeDefined();
			expect(response.body.message).toBe("Usuário registrado");

			// Verify user was created in database
			const user = await prisma.user.findUnique({
				where: { email: userData.email }
			});
			expect(user).toBeDefined();
			expect(user?.name).toBe(userData.name);
			expect(user?.role).toBe(userData.role);
		});

		it("should not register user with existing email", async () => {
			const userData = {
				name: "Test User",
				email: "test@example.com",
				password: "password123",
				role: "VENDEDOR"
			};

			// Create first user
			await request(app)
				.post("/api/v1/auth/register")
				.send(userData)
				.expect(201);

			// Try to create second user with same email
			const response = await request(app)
				.post("/api/v1/auth/register")
				.send(userData)
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("E-mail já cadastrado");
		});

		it("should validate required fields", async () => {
			const response = await request(app)
				.post("/api/v1/auth/register")
				.send({})
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("Dados inválidos");
		});
	});

	describe("POST /api/v1/auth/login", () => {
		beforeEach(async () => {
			const hashedPassword = await bcrypt.hash("password123", 10);
			await prisma.user.create({
				data: {
					name: "Test User",
					email: "test@example.com",
					password: hashedPassword,
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
				})
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.token).toBeDefined();
			expect(response.body.message).toBe("Login efetuado");
		});

		it("should reject login with invalid email", async () => {
			const response = await request(app)
				.post("/api/v1/auth/login")
				.send({
					email: "nonexistent@example.com",
					password: "password123"
				})
				.expect(401);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("Credenciais inválidas");
		});

		it("should reject login with invalid password", async () => {
			const response = await request(app)
				.post("/api/v1/auth/login")
				.send({
					email: "test@example.com",
					password: "wrongpassword"
				})
				.expect(401);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("Credenciais inválidas");
		});
	});

	describe("GET /api/v1/auth/demo", () => {
		it("should return demo token", async () => {
			const response = await request(app)
				.get("/api/v1/auth/demo")
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.token).toBeDefined();
			expect(response.body.message).toBe("Token de demo");
		});
	});

	describe("Rate Limiting", () => {
		it("should limit repeated login attempts", async () => {
			const loginData = {
				email: "test@example.com",
				password: "wrongpassword"
			};

			// Make multiple requests
			for (let i = 0; i < 25; i++) {
				const response = await request(app)
					.post("/api/v1/auth/login")
					.send(loginData);

				if (i >= 20) {
					expect(response.status).toBe(429);
					expect(response.body.message).toBe("Muitas tentativas. Tente novamente mais tarde.");
				}
			}
		});
	});
});