import { Router } from "express";
import jwt from "jsonwebtoken";
import { makeResponse } from "../../core/apiResponse";
import type { UserRole } from "../../core/auth";

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

authRouter.post("/login", (req, res) => {
	const { userId, role } = req.body ?? {} as { userId?: string; role?: UserRole };
	const token = sign({ id: userId || "user", role: role || "VENDEDOR" });
	return res.status(200).json(makeResponse({ token }, { message: "Login efetuado", traceId: req.traceId, success: true }));
});