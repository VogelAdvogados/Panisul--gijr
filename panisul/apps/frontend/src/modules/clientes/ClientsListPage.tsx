import React, { useEffect, useState, useCallback } from "react";
import { http } from "../../shared/http";
import { Link } from "react-router-dom";

type Client = { id: string; name: string; email?: string | null; phone: string; createdAt: string };

type ClientListResponse = { items: Client[]; total: number; page: number; pageSize: number; totalPages: number };

export function ClientsListPage() {
	const [clients, setClients] = useState<Client[]>([]);
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [msg, setMsg] = useState("");
	const [q, setQ] = useState("");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(false);

	const load = useCallback(async (p = 1, query = "") => {
		try {
			setIsLoading(true);
			const { data } = await http.get("/clients", { params: { page: p, q: query } });
			const resp: ClientListResponse = data?.data ?? { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
			setClients(resp.items);
			setPage(resp.page);
			setTotalPages(resp.totalPages);
		} catch (error) {
			console.error("Failed to load clients:", error);
			setMsg("Erro ao carregar clientes");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => { 
		load(); 
	}, [load]);

	async function create(ev: React.FormEvent) {
		ev.preventDefault();
		setMsg("");
		
		if (!name.trim() || !phone.trim()) { 
			setMsg("Nome e telefone são obrigatórios"); 
			return; 
		}
		
		try {
			await http.post("/clients", { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined });
			setName(""); 
			setPhone(""); 
			setEmail("");
			await load(1, q);
			setMsg("Cliente criado");
		} catch (error: any) {
			setMsg(error?.response?.data?.message ?? "Erro ao criar cliente");
		}
	}

	function search(ev: React.FormEvent) {
		ev.preventDefault();
		load(1, q);
	}

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-semibold">Clientes</h1>
			<form onSubmit={create} className="grid grid-cols-4 gap-2 items-end">
				<input 
					className="col-span-2 border rounded p-2" 
					placeholder="Nome" 
					value={name} 
					onChange={(e) => setName(e.target.value)}
					required
				/>
				<input 
					className="col-span-1 border rounded p-2" 
					placeholder="Telefone" 
					value={phone} 
					onChange={(e) => setPhone(e.target.value)}
					required
				/>
				<input 
					className="col-span-1 border rounded p-2" 
					placeholder="E-mail (opcional)" 
					type="email"
					value={email} 
					onChange={(e) => setEmail(e.target.value)} 
				/>
				<button 
					className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
					disabled={isLoading}
				>
					{isLoading ? "Adicionando..." : "Adicionar"}
				</button>
			</form>
			<form onSubmit={search} className="flex items-center gap-2">
				<input 
					className="border rounded p-2" 
					placeholder="Buscar por nome/telefone/e-mail" 
					value={q} 
					onChange={(e) => setQ(e.target.value)} 
				/>
				<button 
					className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
					disabled={isLoading}
				>
					Buscar
				</button>
			</form>
			<table className="w-full text-left text-sm">
				<thead>
					<tr className="border-b">
						<th className="py-2">Nome</th>
						<th>Telefone</th>
						<th>E-mail</th>
						<th>Cadastro</th>
					</tr>
				</thead>
				<tbody>
					{clients.map(c => (
						<tr key={c.id} className="border-b hover:bg-gray-50">
							<td className="py-2">
								<Link to={`/clients/${c.id}`} className="text-blue-700 underline">
									{c.name}
								</Link>
							</td>
							<td>{c.phone}</td>
							<td>{c.email ?? "-"}</td>
							<td>{new Date(c.createdAt).toLocaleString()}</td>
						</tr>
					))}
					{clients.length === 0 && !isLoading && (
						<tr>
							<td colSpan={4} className="py-4 text-center text-gray-500">
								Nenhum cliente encontrado
							</td>
						</tr>
					)}
					{isLoading && (
						<tr>
							<td colSpan={4} className="py-4 text-center text-gray-500">
								Carregando...
							</td>
						</tr>
					)}
				</tbody>
			</table>
			<div className="flex items-center gap-2">
				<button 
					disabled={page <= 1 || isLoading} 
					onClick={() => load(page - 1, q)} 
					className="px-3 py-1 border rounded disabled:opacity-50"
				>
					Anterior
				</button>
				<span className="text-sm">Página {page} de {totalPages}</span>
				<button 
					disabled={page >= totalPages || isLoading} 
					onClick={() => load(page + 1, q)} 
					className="px-3 py-1 border rounded disabled:opacity-50"
				>
					Próxima
				</button>
			</div>
			{msg && <p className="text-sm text-gray-700">{msg}</p>}
		</div>
	);
}