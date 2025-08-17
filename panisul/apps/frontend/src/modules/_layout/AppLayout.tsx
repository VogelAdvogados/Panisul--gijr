import React from "react";
import { Link, useNavigate } from "react-router-dom";

export function AppLayout({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	function logout() {
		localStorage.removeItem("panisul_token");
		navigate("/login", { replace: true });
	}
	return (
		<div className="min-h-screen flex flex-col">
			<header className="bg-white border-b">
				<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
					<nav className="flex items-center gap-4 text-sm">
						<Link to="/" className="text-blue-700 hover:underline">Vendas</Link>
						<Link to="/clients" className="text-blue-700 hover:underline">Clientes</Link>
						<Link to="/exchanges" className="text-blue-700 hover:underline">Trocas</Link>
						<Link to="/production" className="text-blue-700 hover:underline">Produção</Link>
					</nav>
					<button onClick={logout} className="text-sm text-gray-700 hover:text-black">Sair</button>
				</div>
			</header>
			<main className="flex-1">
				{children}
			</main>
		</div>
	);
}