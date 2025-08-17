import { z } from "zod";

export const ApiErrorCode = z.enum([
  "ESTOQUE.INSUFICIENTE",
  "VALIDACAO.CAMPO_OBRIGATORIO",
  "AUTH.NAO_AUTORIZADO"
]);
export type ApiErrorCode = z.infer<typeof ApiErrorCode>;

export const ApiErrorSchema = z.object({
  code: ApiErrorCode,
  message: z.string()
});

export const ApiResponseEnvelope = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.nullable(),
    message: z.string().nullable(),
    errors: z.array(ApiErrorSchema).optional().default([]),
    meta: z.object({
      traceId: z.string().uuid()
    })
  });

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string | null;
  errors?: Array<{ code: ApiErrorCode; message: string }>;
  meta: { traceId: string };
};