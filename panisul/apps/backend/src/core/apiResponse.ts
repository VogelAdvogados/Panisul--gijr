import { randomUUID } from "crypto";
import type { ApiResponse } from "@panisul/contracts/v1/common";

export function makeResponse<T>(data: T | null, params?: { message?: string | null; errors?: ApiResponse<T>["errors"]; traceId?: string; success?: boolean }) {
	const traceId = params?.traceId ?? randomUUID();
	const hasErrors = params?.errors && params.errors.length > 0;
	const success = params?.success ?? (!hasErrors && data !== null);
	const payload: ApiResponse<T> = {
		success,
		data,
		message: params?.message ?? null,
		errors: params?.errors ?? [],
		meta: { traceId }
	};
	return payload;
}