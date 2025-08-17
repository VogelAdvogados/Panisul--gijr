import { z } from "zod";

export const ExchangeItemSchema = z.object({
	productId: z.string(),
	quantity: z.number().positive()
});

export const CreateExchangeDTO = z.object({
	clientId: z.string().optional(),
	inItems: z.array(ExchangeItemSchema).default([]),
	outItems: z.array(ExchangeItemSchema).default([])
}).refine((d) => d.inItems.length > 0 || d.outItems.length > 0, {
	message: "Informe pelo menos um item de entrada ou saída"
});

export type CreateExchangeInput = z.infer<typeof CreateExchangeDTO>;