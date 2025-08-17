import React, { useEffect, useMemo, useState } from "react";
import { http } from "../../shared/http";
import { z } from "zod";
import { CreateProductionDTO } from "@panisul/contracts/v1/producao";

export function ProductionPage() {
	const [products, setProducts] = useState<Array<{ id: string; name: string; stockQty: number }>>([]);
	const [outputs, setOutputs] = useState<Array<{ productId: string; quantity: number }>>([{ productId: "", quantity: 1 }]);
	const [consumption, setConsumption] = useState<Array<{ productId: string; quantity: number }>>([]);
	const [msg, setMsg] = useState("");
	const [traceId, setTraceId] = useState("");
	const [errors, setErrors] = useState<string[]>([]);

	useEffect(() => {
		(async () => {
			const { data } = await http.get("/products");
			setProducts((data?.data ?? []).map((p: any) => ({ id: p.id, name: p.name, stockQty: p.stockQty })));
		})();
	}, []);

	const totalOutputs = useMemo(() => outputs.reduce((s, it) => s + (Number(it.quantity) || 0), 0), [outputs]);
	const totalConsumption = useMemo(() => consumption.reduce((s, it) => s + (Number(it.quantity) || 0), 0), [consumption]);

	function setOut(idx: number, key: "productId" | "quantity", val: string) {
		setOutputs(prev => prev.map((it, i) => i === idx ? { ...it, [key]: key === "quantity" ? Number(val) : val } : it));
	}
	function addOut() { setOutputs(prev => [...prev, { productId: "", quantity: 1 }]); }
	function removeOut(idx: number) { setOutputs(prev => prev.filter((_, i) => i !== idx)); }

	function setCons(idx: number, key: "productId" | "quantity", val: string) {
		setConsumption(prev => prev.map((it, i) => i === idx ? { ...it, [key]: key === "quantity" ? Number(val) : val } : it));
	}
	function addCons() { setConsumption(prev => [...prev, { productId: "", quantity: 1 }]); }
	function removeCons(idx: number) { setConsumption(prev => prev.filter((_, i) => i !== idx)); }

	function getProduct(pid: string) {
		return products.find(p => p.id === pid);
	}

	function validateForm() {
		const errs: string[] = [];
		const cleanedOutputs = outputs.filter(o => o.productId && o.quantity > 0);
		const cleanedConsumption = consumption.filter(c => c.productId && c.quantity > 0);
		const parsed = CreateProductionDTO.safeParse({ outputs: cleanedOutputs, consumption: cleanedConsumption });
		if (!parsed.success) {
			errs.push(...parsed.error.errors.map(e => e.message));
		}
		// Stock checks for consumption
		for (const c of cleanedConsumption) {
			const prod = getProduct(c.productId);
			if (prod && c.quantity > prod.stockQty) {
				errs.push(`Consumo de ${c.quantity} excede o estoque atual (${prod.stockQty}) do produto ${prod.name}`);
			}
		}
		return { errs, cleanedOutputs, cleanedConsumption };
	}

	async function submit(ev: React.FormEvent) {
		ev.preventDefault();
		setMsg("");
		setTraceId("");
		setErrors([]);
		const { errs, cleanedOutputs, cleanedConsumption } = validateForm();
		if (errs.length) { setErrors(errs); return; }
		try {
			const res = await http.post("/production", { outputs: cleanedOutputs, consumption: cleanedConsumption });
			setMsg(res.data?.message ?? "Produção registrada");
			setTraceId(res.headers["x-trace-id"] ?? "");
			setOutputs([{ productId: "", quantity: 1 }]);
			setConsumption([]);
		} catch (e: any) {
			setMsg(e?.response?.data?.message ?? "Erro ao registrar produção");
			setTraceId(e?.response?.headers?.["x-trace-id"] ?? "");
		}
	}

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-4">
			<h1 className="text-2xl font-semibold">Produção</h1>
			<form onSubmit={submit} className="space-y-6">
				<div>
					<h2 className="font-medium mb-2">Saídas</h2>
					{outputs.map((it, idx) => (
						<div key={idx} className="grid grid-cols-8 gap-2 items-center">
							<select className="col-span-5 border rounded p-2" value={it.productId} onChange={(e) => setOut(idx, "productId", e.target.value)}>
								<option value="">Produto</option>
								{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
							</select>
							<input type="number" min={1} className="col-span-2 border rounded p-2" value={it.quantity} onChange={(e) => setOut(idx, "quantity", e.target.value)} />
							<button type="button" className="col-span-1 bg-red-600 text-white px-2 py-2 rounded" onClick={() => removeOut(idx)}>Remover</button>
						</div>
					))}
					<button type="button" className="bg-gray-200 px-3 py-1 rounded" onClick={addOut}>+ Adicionar</button>
					<p className="text-xs text-gray-600 mt-1">Total de saídas: {totalOutputs}</p>
				</div>
				<div>
					<h2 className="font-medium mb-2">Consumo</h2>
					{consumption.map((it, idx) => {
						const p = getProduct(it.productId);
						const warn = p && it.quantity > p.stockQty;
						return (
							<div key={idx} className="grid grid-cols-8 gap-2 items-center">
								<select className={`col-span-5 border rounded p-2 ${warn ? "border-red-500" : ""}`} value={it.productId} onChange={(e) => setCons(idx, "productId", e.target.value)}>
									<option value="">Produto</option>
									{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
								</select>
								<input type="number" min={1} className={`col-span-2 border rounded p-2 ${warn ? "border-red-500" : ""}`} value={it.quantity} onChange={(e) => setCons(idx, "quantity", e.target.value)} />
								<button type="button" className="col-span-1 bg-red-600 text-white px-2 py-2 rounded" onClick={() => removeCons(idx)}>Remover</button>
								{p && (
									<p className={`col-span-8 text-xs ${warn ? "text-red-600" : "text-gray-600"}`}>Estoque atual: {p.stockQty}</p>
								)}
							</div>
						);
					})}
					<button type="button" className="bg-gray-200 px-3 py-1 rounded" onClick={addCons}>+ Adicionar</button>
					<p className="text-xs text-gray-600 mt-1">Total de consumo: {totalConsumption}</p>
				</div>
				{errors.length > 0 && (
					<ul className="list-disc list-inside text-sm text-red-700">
						{errors.map((e, i) => <li key={i}>{e}</li>)}
					</ul>
				)}
				<button className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
			</form>
			{msg && <p className="text-sm text-gray-700">{msg}</p>}
			{traceId && <p className="text-xs text-gray-500">traceId: {traceId}</p>}
		</div>
	);
}