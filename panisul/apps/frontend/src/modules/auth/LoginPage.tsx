import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http, handleApiError } from "../../shared/http";

export function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	async function submit(ev: React.FormEvent) {
		ev.preventDefault();
		setMessage("");
		setError("");

		// Basic validation
		if (!email.trim() || !password.trim()) {
			setError("E-mail e senha são obrigatórios");
			return;
		}

		if (!email.includes("@")) {
			setError("E-mail inválido");
			return;
		}

		setIsLoading(true);

		try {
			const { data } = await http.post("/auth/login", { email, password });
			const token = data?.data?.token;
			
			if (token) {
				localStorage.setItem("panisul_token", token);
				setMessage("Logado com sucesso! Redirecionando...");
				setTimeout(() => navigate("/"), 1000);
			} else {
				setError("Erro ao processar resposta do servidor");
			}
		} catch (err: any) {
			const errorInfo = handleApiError(err);
			setError(errorInfo.message);
			
			// Show specific error for rate limiting
			if (errorInfo.status === 429) {
				setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
			}
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Login PaniSul
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={submit}>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="email" className="sr-only">
								E-mail
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="E-mail"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={isLoading}
							/>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								Senha
							</label>
							<input
								id="password"
								name="password"
								type="password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Senha"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={isLoading}
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
							) : null}
							{isLoading ? "Entrando..." : "Entrar"}
						</button>
					</div>

					{message && (
						<div className="rounded-md bg-green-50 p-4">
							<div className="flex">
								<div className="ml-3">
									<p className="text-sm font-medium text-green-800">{message}</p>
								</div>
							</div>
						</div>
					)}

					{error && (
						<div className="rounded-md bg-red-50 p-4">
							<div className="flex">
								<div className="ml-3">
									<p className="text-sm font-medium text-red-800">{error}</p>
								</div>
							</div>
						</div>
					)}
				</form>
			</div>
		</div>
	);
}