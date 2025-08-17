import { z } from "zod";

export const ClientSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1, "Nome é obrigatório"),
	email: z.string().email().optional().nullable(),
	phone: z.string().optional().nullable(),
	createdAt: z.string().datetime()
});

export const CreateClientDTO = z.object({
	name: z.string().min(1, "Nome é obrigatório"),
	email: z.string().email().optional(),
	phone: z.string().optional()
});

export type Client = z.infer<typeof ClientSchema>;
export type CreateClientInput = z.infer<typeof CreateClientDTO>;