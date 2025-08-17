import { z } from "zod";

export const SaleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  price: z.number().positive()
});

// DTO (Data Transfer Object) para criar uma venda
export const CreateSaleDTO = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  items: z.array(SaleItemSchema).min(1, "A venda precisa ter pelo menos um item"),
  paymentType: z.enum(["AVISTA", "APRAZO"]),
  dueDate: z.string().datetime().optional() // Data de vencimento, opcional
});

export type CreateSaleInput = z.infer<typeof CreateSaleDTO>;

export const SaleSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  clientId: z.string(),
  totalValue: z.number(),
  paymentType: z.enum(["AVISTA", "APRAZO"]),
  dueDate: z.string().datetime().nullable().optional()
});

export type Sale = z.infer<typeof SaleSchema>;