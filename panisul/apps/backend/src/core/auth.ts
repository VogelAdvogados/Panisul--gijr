import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { Errors } from "./errors";

export type UserRole = "ADMIN" | "VENDEDOR" | "PRODUCAO";

export interface AuthUser {
	id: string;
	role: UserRole;
}

declare global {
	namespace Express {
		interface Request {
			user?: AuthUser;
			traceId?: string;
		}
	}
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
	const header = req.headers["authorization"];
	if (!header?.startsWith("Bearer ")) {
		return next(Errors.unauthorized());
	}
	const token = header.slice("Bearer ".length);
	try {
		const secret = process.env.JWT_SECRET ?? "dev-secret";
		const payload = jwt.verify(token, secret) as AuthUser;
		req.user = payload;
		return next();
	} catch {
		return next(Errors.unauthorized());
	}
}

export function requireRoles(...roles: UserRole[]) {
	return (req: Request, _res: Response, next: NextFunction) => {
		if (!req.user) return next(Errors.unauthorized());
		if (!roles.includes(req.user.role)) return next(Errors.unauthorized("Sem permissão"));
		next();
	};
}