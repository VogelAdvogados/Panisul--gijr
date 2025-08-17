import { randomUUID } from "crypto";
import type { ApiResponse } from "@panisul/contracts/v1/common";

export function makeResponse<T>(data: T | null, params?: { message?: string | null; errors?: ApiResponse<T>["errors"]; traceId?: string; success?: boolean }) {
	const traceId = params?.traceId ?? randomUUID();
	const success = params?.success ?? (params?.errors && params.errors.length > 0 ? false : data !== null);
	const payload: ApiResponse<T> = {
		success,
		data,
		message: params?.message ?? null,
		errors: params?.errors ?? [],
		meta: { traceId }
	};
	return payload;
}