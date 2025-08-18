import { Router } from "express";
import jwt from "jsonwebtoken";
import { makeResponse } from "../../core/apiResponse";
import type { UserRole } from "../../core/auth";
import { prisma } from "../../core/prisma";
import { RegisterUserDTO, LoginDTO } from "@panisul/contracts/v1/auth";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { loadConfig } from "../../core/config";

export const authRouter = Router();

const { JWT_SECRET, JWT_EXPIRES_IN } = loadConfig();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		return res
			.status(429)
			.json(
				makeResponse(null, {
					message: "Muitas tentativas. Tente novamente mais tarde.",
					success: false,
					traceId: req.traceId
				})
			);
	}
});

function sign(user: { id: string; role: UserRole }) {
	const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
	return token;
}

authRouter.post("/register", authLimiter, async (req, res, next) => {
	try {
		const input = RegisterUserDTO.parse(req.body);
		
		// Validate email format
		if (!input.email.includes("@")) {
			return res.status(400).json(makeResponse(null, { 
				message: "E-mail inválido", 
				success: false, 
				traceId: req.traceId 
			}));
		}

		const exists = await prisma.user.findUnique({ where: { email: input.email } });
		if (exists) return res.status(400).json(makeResponse(null, { message: "E-mail já cadastrado", success: false, traceId: req.traceId }));
		
		const hash = await bcrypt.hash(input.password, 12); // Increased salt rounds
		const created = await prisma.user.create({ data: { name: input.name, email: input.email, password: hash, role: input.role } });
		const token = sign({ id: created.id, role: created.role as UserRole });
		return res.status(201).json(makeResponse({ token }, { message: "Usuário registrado", traceId: req.traceId, success: true }));
	} catch (err) {
		return next(err);
	}
});

authRouter.post("/login", authLimiter, async (req, res, next) => {
	try {
		const input = LoginDTO.parse(req.body);
		
		// Validate email format
		if (!input.email.includes("@")) {
			return res.status(400).json(makeResponse(null, { 
				message: "E-mail inválido", 
				success: false, 
				traceId: req.traceId 
			}));
		}

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