import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export function attachTraceId(req: Request, _res: Response, next: NextFunction) {
	const incoming = (req.headers["x-trace-id"] as string) || undefined;
	req.traceId = incoming ?? randomUUID();
	next();
}