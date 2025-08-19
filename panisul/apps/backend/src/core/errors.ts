import type { ApiErrorCode } from "@panisul/contracts/v1/common";

export class AppError extends Error {
	constructor(
		public message: string,
		public status: number = 500,
		public code: ApiErrorCode = "VALIDACAO.CAMPO_OBRIGATORIO"
	) {
		super(message);
		this.name = "AppError";
	}
}

export const Errors = {
	validation: (message: string) => new AppError(message, 400, "VALIDACAO.CAMPO_OBRIGATORIO"),
	unauthorized: () => new AppError("Não autorizado", 401, "AUTH.NAO_AUTORIZADO"),
	forbidden: (message: string) => new AppError(message, 403, "AUTH.NAO_AUTORIZADO"),
	notFound: (message: string) => new AppError(message, 404, "VALIDACAO.CAMPO_OBRIGATORIO"),
	stockInsufficient: (message: string) => new AppError(message, 400, "ESTOQUE.INSUFICIENTE"),
	queryInvalid: (message: string) => new AppError(message, 400, "VALIDACAO.QUERY_INVALIDO"),
	paramsInvalid: (message: string) => new AppError(message, 400, "VALIDACAO.PARAMS_INVALIDO")
};