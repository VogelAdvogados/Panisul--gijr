import React, { useEffect, useState } from "react";
import { http } from "../../shared/http";
import { Link } from "react-router-dom";

type Client = { id: string; name: string; email?: string | null; phone: string; createdAt: string };

export function ClientsListPage() {
	const [clients, setClients] = useState<Client[]>([]);
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [msg, setMsg] = useState("");

	async function load() {
		const { data } = await http.get("/clients");
		setClients(data?.data ?? []);
	}

	useEffect(() => { load(); }, []);

	async function create(ev: React.FormEvent) {
		ev.preventDefault();
		setMsg("");
		if (!name || !phone) { setMsg("Nome e telefone são obrigatórios"); return; }
		try {
			await http.post("/clients", { name, phone, email: email || undefined });
			setName(""); setPhone(""); setEmail("");
			await load();
			setMsg("Cliente criado");
		} catch (e: any) {
			setMsg(e?.response?.data?.message ?? "Erro ao criar cliente");
		}
	}

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-semibold">Clientes</h1>
			<form onSubmit={create} className="grid grid-cols-4 gap-2 items-end">
				<input className="col-span-2 border rounded p-2" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
				<input className="col-span-1 border rounded p-2" placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
				<input className="col-span-1 border rounded p-2" placeholder="E-mail (opcional)" value={email} onChange={(e) => setEmail(e.target.value)} />
				<button className="bg-blue-600 text-white px-4 py-2 rounded">Adicionar</button>
			</form>
			{msg && <p className="text-sm text-gray-700">{msg}</p>}
			<table className="w-full text-left text-sm">
				<thead>
					<tr className="border-b"><th className="py-2">Nome</th><th>Telefone</th><th>E-mail</th><th>Cadastro</th></tr>
				</thead>
				<tbody>
					{clients.map(c => (
						<tr key={c.id} className="border-b">
							<td className="py-2"><Link to={`/clients/${c.id}`} className="text-blue-700 underline">{c.name}</Link></td>
							<td>{c.phone}</td>
							<td>{c.email ?? "-"}</td>
							<td>{new Date(c.createdAt).toLocaleString()}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}