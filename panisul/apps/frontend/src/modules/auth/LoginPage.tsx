import React, { useState } from "react";
import { http } from "../../shared/http";

export function LoginPage() {
	const [email, setEmail] = useState("admin@panisul.local");
	const [password, setPassword] = useState("admin123");
	const [message, setMessage] = useState("");

	async function submit(ev: React.FormEvent) {
		ev.preventDefault();
		setMessage("");
		try {
			const { data } = await http.post("/auth/login", { email, password });
			const token = data?.data?.token;
			if (token) {
				localStorage.setItem("panisul_token", token);
				setMessage("Logado com sucesso");
			} else {
				setMessage("Erro ao logar");
			}
		} catch (e: any) {
			setMessage(e?.response?.data?.message ?? "Erro");
		}
	}

	return (
		<div className="max-w-sm mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Login</h1>
			<form onSubmit={submit} className="space-y-3">
				<input className="w-full border rounded p-2" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
				<input type="password" className="w-full border rounded p-2" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
				<button className="bg-blue-600 text-white px-4 py-2 rounded">Entrar</button>
			</form>
			{message && <p className="mt-4 text-sm">{message}</p>}
		</div>
	);
}