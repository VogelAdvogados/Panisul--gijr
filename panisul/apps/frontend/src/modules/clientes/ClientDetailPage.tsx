import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { http } from "../../shared/http";

type Client = { id: string; name: string; email?: string | null; phone: string; createdAt: string };

type Receivable = { id: string; saleId: string; amount: number; dueDate: string; status: string };

type Sale = { id: string; createdAt: string; totalValue: number; paymentType: string };

type Exchange = { id: string; createdAt: string; items: Array<{ productId: string; quantity: number; direction: string }>} ;

export function ClientDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [tab, setTab] = useState<"overview" | "financeiro" | "compras" | "trocas">("overview");
	const [client, setClient] = useState<Client | null>(null);
	const [edit, setEdit] = useState(false);
	const [form, setForm] = useState<{ name: string; phone: string; email: string } | null>(null);
	const [msg, setMsg] = useState("");
	const [receivables, setReceivables] = useState<Receivable[]>([]);
	const [sales, setSales] = useState<Sale[]>([]);
	const [exchanges, setExchanges] = useState<Exchange[]>([]);

	async function load() {
		const { data } = await http.get(`/clients/${id}`);
		setClient(data?.data ?? null);
		if (data?.data) setForm({ name: data.data.name, phone: data.data.phone, email: data.data.email ?? "" });
	}

	useEffect(() => { load(); }, [id]);

	useEffect(() => {
		if (tab === "financeiro") (async () => {
			const { data } = await http.get(`/clients/${id}/receivables`);
			setReceivables(data?.data ?? []);
		})();
		if (tab === "compras") (async () => {
			const { data } = await http.get(`/clients/${id}/sales`);
			setSales(data?.data ?? []);
		})();
		if (tab === "trocas") (async () => {
			const { data } = await http.get(`/clients/${id}/exchanges`);
			setExchanges(data?.data ?? []);
		})();
	}, [tab, id]);

	async function save() {
		setMsg("");
		if (!form?.name || !form?.phone) { setMsg("Nome e telefone são obrigatórios"); return; }
		await http.put(`/clients/${id}`, { name: form.name, phone: form.phone, email: form.email || undefined });
		setEdit(false);
		await load();
		setMsg("Cliente atualizado");
	}

	async function removeClient() {
		if (!confirm("Tem certeza que deseja remover este cliente?")) return;
		await http.delete(`/clients/${id}`);
		navigate("/clients", { replace: true });
	}

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-4">
			<Link to="/clients" className="text-blue-700 underline">← Voltar</Link>
			{client && (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-semibold">{client.name}</h1>
						<div className="flex items-center gap-2">
							{!edit && <button className="text-sm px-3 py-1 border rounded" onClick={() => setEdit(true)}>Editar</button>}
							<button className="text-sm px-3 py-1 border rounded text-red-700" onClick={removeClient}>Remover</button>
						</div>
					</div>
					<p className="text-xs text-gray-500">Cadastrado em {new Date(client.createdAt).toLocaleString()}</p>
					{edit ? (
						<div className="grid grid-cols-3 gap-2">
							<input className="border rounded p-2" placeholder="Nome" value={form?.name ?? ""} onChange={(e) => setForm(s => ({ ...(s as any), name: e.target.value }))} />
							<input className="border rounded p-2" placeholder="Telefone" value={form?.phone ?? ""} onChange={(e) => setForm(s => ({ ...(s as any), phone: e.target.value }))} />
							<input className="border rounded p-2" placeholder="E-mail (opcional)" value={form?.email ?? ""} onChange={(e) => setForm(s => ({ ...(s as any), email: e.target.value }))} />
							<div className="col-span-3 flex items-center gap-2">
								<button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={save}>Salvar</button>
								<button className="px-4 py-2 rounded border" onClick={() => setEdit(false)}>Cancelar</button>
							</div>
							{msg && <p className="text-sm text-gray-700">{msg}</p>}
						</div>
					) : (
						<p className="text-sm text-gray-700">Telefone: {client.phone} · Email: {client.email ?? "-"}</p>
					)}
				</div>
			)}
			<div className="flex gap-2 border-b">
				<button className={`px-3 py-2 ${tab === "overview" ? "border-b-2 border-blue-600" : ""}`} onClick={() => setTab("overview")}>Ficha</button>
				<button className={`px-3 py-2 ${tab === "financeiro" ? "border-b-2 border-blue-600" : ""}`} onClick={() => setTab("financeiro")}>Financeiro</button>
				<button className={`px-3 py-2 ${tab === "compras" ? "border-b-2 border-blue-600" : ""}`} onClick={() => setTab("compras")}>Histórico de compras</button>
				<button className={`px-3 py-2 ${tab === "trocas" ? "border-b-2 border-blue-600" : ""}`} onClick={() => setTab("trocas")}>Histórico de trocas</button>
			</div>
			{tab === "overview" && client && !edit && (
				<div className="space-y-1">
					<p><strong>Nome:</strong> {client.name}</p>
					<p><strong>Telefone:</strong> {client.phone}</p>
					<p><strong>E-mail:</strong> {client.email ?? "-"}</p>
				</div>
			)}
			{tab === "financeiro" && (
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b"><th className="py-2">Vencimento</th><th>Valor</th><th>Status</th><th>Venda</th></tr>
					</thead>
					<tbody>
						{receivables.map(r => (
							<tr key={r.id} className="border-b">
								<td className="py-2">{new Date(r.dueDate).toLocaleDateString()}</td>
								<td>{r.amount.toFixed(2)}</td>
								<td>{r.status}</td>
								<td><Link className="text-blue-700 underline" to={`/sales/${r.saleId}`}>{r.saleId}</Link></td>
							</tr>
						))}
					</tbody>
				</table>
			)}
			{tab === "compras" && (
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b"><th className="py-2">Data</th><th>Valor total</th><th>Pagamento</th></tr>
					</thead>
					<tbody>
						{sales.map(s => (
							<tr key={s.id} className="border-b">
								<td className="py-2">{new Date(s.createdAt).toLocaleString()}</td>
								<td>{s.totalValue.toFixed(2)}</td>
								<td>{s.paymentType}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
			{tab === "trocas" && (
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="border-b"><th className="py-2">Data</th><th>Itens</th></tr>
					</thead>
					<tbody>
						{exchanges.map(e => (
							<tr key={e.id} className="border-b">
								<td className="py-2">{new Date(e.createdAt).toLocaleString()}</td>
								<td>{e.items.map(i => `${i.direction === "IN" ? "+" : "-"}${i.quantity}(${i.productId})`).join(", ")}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}