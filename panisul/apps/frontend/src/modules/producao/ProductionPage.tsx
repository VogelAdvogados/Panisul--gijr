import React, { useEffect, useState } from "react";
import { http } from "../../shared/http";

export function ProductionPage() {
	const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
	const [outputs, setOutputs] = useState<Array<{ productId: string; quantity: number }>>([{ productId: "", quantity: 1 }]);
	const [consumption, setConsumption] = useState<Array<{ productId: string; quantity: number }>>([]);
	const [msg, setMsg] = useState("");

	useEffect(() => {
		(async () => {
			const { data } = await http.get("/products");
			setProducts((data?.data ?? []).map((p: any) => ({ id: p.id, name: p.name })));
		})();
	}, []);

	function setOut(idx: number, key: "productId" | "quantity", val: string) {
		setOutputs(prev => prev.map((it, i) => i === idx ? { ...it, [key]: key === "quantity" ? Number(val) : val } : it));
	}
	function addOut() { setOutputs(prev => [...prev, { productId: "", quantity: 1 }]); }
	function setCons(idx: number, key: "productId" | "quantity", val: string) {
		setConsumption(prev => prev.map((it, i) => i === idx ? { ...it, [key]: key === "quantity" ? Number(val) : val } : it));
	}
	function addCons() { setConsumption(prev => [...prev, { productId: "", quantity: 1 }]); }

	async function submit(ev: React.FormEvent) {
		ev.preventDefault();
		setMsg("");
		try {
			await http.post("/production", { outputs, consumption });
			setMsg("Produção registrada");
		} catch (e: any) {
			setMsg(e?.response?.data?.message ?? "Erro ao registrar produção");
		}
	}

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-4">
			<h1 className="text-2xl font-semibold">Produção</h1>
			<form onSubmit={submit} className="space-y-4">
				<div>
					<h2 className="font-medium">Saídas</h2>
					{outputs.map((it, idx) => (
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
				<div>
					<h2 className="font-medium">Consumo</h2>
					{consumption.map((it, idx) => (
						<div key={idx} className="grid grid-cols-6 gap-2 items-center">
							<select className="col-span-4 border rounded p-2" value={it.productId} onChange={(e) => setCons(idx, "productId", e.target.value)}>
								<option value="">Produto</option>
								{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
							</select>
							<input type="number" className="col-span-2 border rounded p-2" value={it.quantity} onChange={(e) => setCons(idx, "quantity", e.target.value)} />
						</div>
					))}
					<button type="button" className="bg-gray-200 px-3 py-1 rounded" onClick={addCons}>+ Adicionar</button>
				</div>
				<button className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
			</form>
			{msg && <p className="text-sm text-gray-700">{msg}</p>}
		</div>
	);
}