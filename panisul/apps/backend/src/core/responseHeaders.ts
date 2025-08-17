import type { Request, Response, NextFunction } from "express";

export function attachResponseTraceHeader(req: Request, res: Response, next: NextFunction) {
	if (req.traceId) {
		res.setHeader("x-trace-id", req.traceId);
	}
	next();
}