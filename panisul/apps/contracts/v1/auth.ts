import { z } from "zod";

export const UserRoleSchema = z.enum(["ADMIN", "VENDEDOR", "PRODUCAO"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const RegisterUserDTO = z.object({
	name: z.string().min(1, "Nome é obrigatório"),
	email: z.string().email(),
	password: z.string().min(6, "Senha precisa ter ao menos 6 caracteres"),
	role: UserRoleSchema
});

export const LoginDTO = z.object({
	email: z.string().email(),
	password: z.string().min(1)
});

export const AuthTokenSchema = z.object({ token: z.string() });
export type RegisterUserInput = z.infer<typeof RegisterUserDTO>;
export type LoginInput = z.infer<typeof LoginDTO>;