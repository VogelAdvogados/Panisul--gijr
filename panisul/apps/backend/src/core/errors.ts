import type { ApiErrorCode } from "@panisul/contracts/v1/common";

export class AppError extends Error {
	public readonly status: number;
	public readonly code: ApiErrorCode;

	constructor(code: ApiErrorCode, message: string, status = 400) {
		super(message);
		this.code = code;
		this.status = status;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export const Errors = {
	unauthorized: (message = "Não autorizado") => new AppError("AUTH.NAO_AUTORIZADO", message, 401),
	forbidden: (message = "Sem permissão") => new AppError("AUTH.NAO_AUTORIZADO", message, 403),
	validation: (message = "Dados inválidos") => new AppError("VALIDACAO.CAMPO_OBRIGATORIO", message, 400),
	stockInsufficient: (message = "Estoque insuficiente") => new AppError("ESTOQUE.INSUFICIENTE", message, 422)
};