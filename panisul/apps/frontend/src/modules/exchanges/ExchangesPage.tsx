import React, { useEffect, useState } from "react";
import { http } from "../../shared/http";

export function ExchangesPage() {
	const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
	const [clientId, setClientId] = useState<string>("");
	const [inItems, setInItems] = useState<Array<{ productId: string; quantity: number }>>([{ productId: "", quantity: 1 }]);
	const [outItems, setOutItems] = useState<Array<{ productId: string; quantity: number }>>([{ productId: "", quantity: 1 }]);
	const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
	const [msg, setMsg] = useState("");

	useEffect(() => {
		(async () => {
			const [pc, pp] = await Promise.all([http.get("/clients"), http.get("/products")]);
			setClients((pc.data?.data ?? []).map((c: any) => ({ id: c.id, name: c.name })));
			setProducts((pp.data?.data ?? []).map((p: any) => ({ id: p.id, name: p.name })));
		})();
	}, []);

	function setIn(idx: number, key: "productId" | "quantity", val: string) {
		setInItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: key === "quantity" ? Number(val) : val } : it));
	}
	function addIn() { setInItems(prev => [...prev, { productId: "", quantity: 1 }]); }
	function setOut(idx: number, key: "productId" | "quantity", val: string) {
		setOutItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: key === "quantity" ? Number(val) : val } : it));
	}
	function addOut() { setOutItems(prev => [...prev, { productId: "", quantity: 1 }]); }

	async function submit(ev: React.FormEvent) {
		ev.preventDefault();
		setMsg("");
		try {
			await http.post("/exchanges", { clientId: clientId || undefined, inItems, outItems });
			setMsg("Troca registrada");
		} catch (e: any) {
			setMsg(e?.response?.data?.message ?? "Erro ao registrar troca");
		}
	}

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-4">
			<h1 className="text-2xl font-semibold">Trocas</h1>
			<form onSubmit={submit} className="space-y-4">
				<div className="flex gap-2 items-center">
					<select className="border rounded p-2" value={clientId} onChange={(e) => setClientId(e.target.value)}>
						<option value="">Cliente (opcional)</option>
						{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
					</select>
				</div>
				<div>
					<h2 className="font-medium">Entradas</h2>
					{inItems.map((it, idx) => (
						<div key={idx} className="grid grid-cols-6 gap-2 items-center">
							<select className="col-span-4 border rounded p-2" value={it.productId} onChange={(e) => setIn(idx, "productId", e.target.value)}>
								<option value="">Produto</option>
								{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
							</select>
							<input type="number" className="col-span-2 border rounded p-2" value={it.quantity} onChange={(e) => setIn(idx, "quantity", e.target.value)} />
						</div>
					))}
					<button type="button" className="bg-gray-200 px-3 py-1 rounded" onClick={addIn}>+ Adicionar</button>
				</div>
				<div>
					<h2 className="font-medium">Saídas</h2>
					{outItems.map((it, idx) => (
						<div key={idx} className="grid grid-cols-6 gap-2 items-center">
							<select className="col-span-4 border rounded p-2" value={it.productId} onChange={(e) => setOut(idx, "productId", e.target.value)}>
								<option value="">Produto</option>
								{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
							</select>
							<input type="number" className="col-span-2 border rounded p-2" value={it.quantity} onChange={(e) => setOut(idx, "quantity", e.target.value)} />
						</div>
					))}
					<button type="button" className="bg-gray-200 px-3 py-1 rounded" onClick={addOut}>+ Adicionar</button>
				</div>
				<button className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
			</form>
			{msg && <p className="text-sm text-gray-700">{msg}</p>}
		</div>
	);
}