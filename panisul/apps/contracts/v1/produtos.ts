import { z } from "zod";

export const ProductSchema = z.object({
	id: z.string(),
	name: z.string(),
	stockQty: z.number(),
	costAvg: z.number()
});

export type Product = z.infer<typeof ProductSchema>;