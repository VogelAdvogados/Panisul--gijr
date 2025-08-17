import { z } from "zod";

export const ProductionItemSchema = z.object({
	productId: z.string(),
	quantity: z.number().positive()
});

export const CreateProductionDTO = z.object({
	outputs: z.array(ProductionItemSchema).min(1, "Produção requer ao menos um produto de saída"),
	consumption: z.array(ProductionItemSchema).optional().default([])
});

export type CreateProductionInput = z.infer<typeof CreateProductionDTO>;