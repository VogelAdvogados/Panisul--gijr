import { Router } from "express";
import jwt from "jsonwebtoken";
import { makeResponse } from "../../core/apiResponse";
import type { UserRole } from "../../core/auth";
import { prisma } from "../../core/prisma";
import { RegisterUserDTO, LoginDTO } from "@panisul/contracts/v1/auth";
import bcrypt from "bcryptjs";

export const authRouter = Router();

function sign(user: { id: string; role: UserRole }) {
	const secret = process.env.JWT_SECRET ?? "dev-secret";
	const token = jwt.sign(user, secret, { expiresIn: "7d" });
	return token;
}

authRouter.get("/demo", (req, res) => {
	const token = sign({ id: "demo-user", role: "ADMIN" });
	return res.status(200).json(makeResponse({ token }, { message: "Token de demo", traceId: req.traceId, success: true }));
});

authRouter.post("/register", async (req, res, next) => {
	try {
		const input = RegisterUserDTO.parse(req.body);
		const exists = await prisma.user.findUnique({ where: { email: input.email } });
		if (exists) return res.status(400).json(makeResponse(null, { message: "E-mail já cadastrado", success: false, traceId: req.traceId }));
		const hash = await bcrypt.hash(input.password, 10);
		const created = await prisma.user.create({ data: { name: input.name, email: input.email, password: hash, role: input.role } });
		const token = sign({ id: created.id, role: created.role as UserRole });
		return res.status(201).json(makeResponse({ token }, { message: "Usuário registrado", traceId: req.traceId, success: true }));
	} catch (err) {
		return next(err);
	}
});

authRouter.post("/login", async (req, res, next) => {
	try {
		const input = LoginDTO.parse(req.body);
		const user = await prisma.user.findUnique({ where: { email: input.email } });
		if (!user) return res.status(401).json(makeResponse(null, { message: "Credenciais inválidas", success: false, traceId: req.traceId }));
		const ok = await bcrypt.compare(input.password, user.password);
		if (!ok) return res.status(401).json(makeResponse(null, { message: "Credenciais inválidas", success: false, traceId: req.traceId }));
		const token = sign({ id: user.id, role: user.role as UserRole });
		return res.status(200).json(makeResponse({ token }, { message: "Login efetuado", traceId: req.traceId, success: true }));
	} catch (err) {
		return next(err);
	}
});