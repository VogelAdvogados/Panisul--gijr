import React, { useState } from "react";
import { z } from "zod";
import { CreateSaleDTO } from "@panisul/contracts/v1/vendas";
import axios from "axios";

const SaleFormSchema = CreateSaleDTO;

 type FormData = z.infer<typeof SaleFormSchema>;

async function ensureToken(): Promise<string> {
	const key = "panisul_token";
	const existing = localStorage.getItem(key);
	if (existing) return existing;
	const { data } = await axios.get("/api/v1/auth/demo");
	const token = data?.data?.token ?? "";
	if (token) localStorage.setItem(key, token);
	return token;
}

export function SalesPage() {
const [form, setForm] = useState<FormData>({
		clientId: "",
		items: [{ productId: "", quantity: 1, price: 0 }],
		paymentType: "AVISTA"
	});
	const [message, setMessage] = useState<string>("");

	function updateItem(index: number, key: "productId" | "quantity" | "price", value: string) {
		setForm((prev) => {
			const copy = { ...prev };
			const items = [...copy.items];
			const item = { ...items[index] };
			if (key === "quantity" || key === "price") {
				(item as any)[key] = Number(value);
			} else {
				(item as any)[key] = value;
			}
			items[index] = item;
			copy.items = items;
			return copy;
		});
	}

	async function submit(ev: React.FormEvent) {
		ev.preventDefault();
		setMessage("");
		const parsed = SaleFormSchema.safeParse(form);
		if (!parsed.success) {
			setMessage(parsed.error.errors.map((e) => e.message).join(", "));
			return;
		}
		try {
			const token = await ensureToken();
			const res = await axios.post("/api/v1/sales", parsed.data, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setMessage(res.data.message ?? "Ok");
		} catch (e: any) {
			if (e?.response?.status === 401) {
				localStorage.removeItem("panisul_token");
				setMessage("Sessão expirada. Tente novamente.");
				return;
			}
			setMessage(e?.response?.data?.message ?? "Erro ao enviar");
		}
	}

	return (
		<div className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Registrar Venda</h1>
			<form onSubmit={submit} className="space-y-4">
				<input className="w-full border rounded p-2" placeholder="Cliente" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} />
				<div className="space-y-2">
					{form.items.map((it, idx) => (
						<div key={idx} className="grid grid-cols-3 gap-2">
							<input className="border rounded p-2" placeholder="Produto ID" value={it.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)} />
							<input type="number" className="border rounded p-2" placeholder="Qtd" value={it.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
							<input type="number" className="border rounded p-2" placeholder="Preço" value={it.price} onChange={(e) => updateItem(idx, "price", e.target.value)} />
						</div>
					))}
				</div>
				<div className="flex items-center gap-2">
					<select className="border rounded p-2" value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: e.target.value as any })}>
						<option value="AVISTA">À vista</option>
						<option value="APRAZO">A prazo</option>
					</select>
					{form.paymentType === "APRAZO" && (
						<input type="datetime-local" className="border rounded p-2" value={form.dueDate ?? ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
					)}
				</div>
				<button className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
			</form>
			{message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
		</div>
	);
}

// Token somente para demo local (ADMIN). Em produção, obter via login.
const demoToken = (() => {
	// header.payload.signature (não valida de verdade sem segredo compartilhado; aqui é mock)
	return "";
})();