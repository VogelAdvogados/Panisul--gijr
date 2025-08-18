import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { CreateSaleDTO } from "@panisul/contracts/v1/vendas";
import { http } from "../../shared/http";
const SaleFormSchema = CreateSaleDTO;
async function ensureToken() {
    const key = "panisul_token";
    const existing = localStorage.getItem(key);
    if (existing)
        return existing;
    const { data } = await http.get("/auth/demo");
    const token = data?.data?.token ?? "";
    if (token)
        localStorage.setItem(key, token);
    return token;
}
export function SalesPage() {
    const [form, setForm] = useState({
        clientId: "",
        items: [{ productId: "", quantity: 1, price: 0 }],
        paymentType: "AVISTA"
    });
    const [message, setMessage] = useState("");
    const [traceId, setTraceId] = useState("");
    const [errorCode, setErrorCode] = useState("");
    const [products, setProducts] = useState([]);
    useEffect(() => {
        (async () => {
            const token = await ensureToken();
            const { data, headers } = await http.get("/products");
            setProducts(data?.data ?? []);
            setTraceId(headers["x-trace-id"] ?? "");
        })();
    }, []);
    function updateItem(index, key, value) {
        setForm((prev) => {
            const copy = { ...prev };
            const items = [...copy.items];
            const item = { ...items[index] };
            if (key === "quantity" || key === "price") {
                item[key] = Number(value);
            }
            else {
                item[key] = value;
            }
            items[index] = item;
            copy.items = items;
            return copy;
        });
    }
    function addItem() {
        setForm((prev) => ({ ...prev, items: [...prev.items, { productId: "", quantity: 1, price: 0 }] }));
    }
    function removeItem(index) {
        setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    }
    async function submit(ev) {
        ev.preventDefault();
        setMessage("");
        setErrorCode("");
        const parsed = SaleFormSchema.safeParse(form);
        if (!parsed.success) {
            setMessage(parsed.error.errors.map((e) => e.message).join(", "));
            return;
        }
        try {
            const res = await http.post("/sales", parsed.data);
            setMessage(res.data.message ?? "Ok");
            setTraceId(res.headers["x-trace-id"] ?? "");
        }
        catch (e) {
            if (e?.response?.status === 401) {
                localStorage.removeItem("panisul_token");
                setMessage("Sessão expirada. Tente novamente.");
                return;
            }
            setMessage(e?.response?.data?.message ?? "Erro ao enviar");
            setTraceId(e?.response?.headers?.["x-trace-id"] ?? "");
            const code = e?.response?.data?.errors?.[0]?.code;
            if (code)
                setErrorCode(code);
        }
    }
    return (_jsxs("div", { className: "max-w-2xl mx-auto p-6", children: [_jsx("h1", { className: "text-2xl font-semibold mb-4", children: "Registrar Venda" }), _jsxs("form", { onSubmit: submit, className: "space-y-4", children: [_jsx("input", { className: "w-full border rounded p-2", placeholder: "Cliente", value: form.clientId, onChange: (e) => setForm({ ...form, clientId: e.target.value }) }), _jsxs("div", { className: "space-y-2", children: [form.items.map((it, idx) => (_jsxs("div", { className: "grid grid-cols-12 gap-2 items-center", children: [_jsx("div", { className: "col-span-5", children: _jsxs("select", { className: "w-full border rounded p-2", value: it.productId, onChange: (e) => updateItem(idx, "productId", e.target.value), children: [_jsx("option", { value: "", children: "Selecione um produto" }), products.map((p) => (_jsxs("option", { value: p.id, children: [p.name, " (est: ", p.stockQty, ")"] }, p.id)))] }) }), _jsx("input", { type: "number", className: "col-span-2 border rounded p-2", placeholder: "Qtd", value: it.quantity, onChange: (e) => updateItem(idx, "quantity", e.target.value) }), _jsx("input", { type: "number", className: "col-span-3 border rounded p-2", placeholder: "Pre\u00E7o", value: it.price, onChange: (e) => updateItem(idx, "price", e.target.value) }), _jsx("button", { type: "button", className: "col-span-2 bg-red-600 text-white px-2 py-2 rounded", onClick: () => removeItem(idx), children: "Remover" })] }, idx))), _jsx("button", { type: "button", className: "bg-gray-200 px-3 py-1 rounded", onClick: addItem, children: "+ Adicionar item" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("select", { className: "border rounded p-2", value: form.paymentType, onChange: (e) => setForm({ ...form, paymentType: e.target.value }), children: [_jsx("option", { value: "AVISTA", children: "\u00C0 vista" }), _jsx("option", { value: "APRAZO", children: "A prazo" })] }), form.paymentType === "APRAZO" && (_jsx("input", { type: "datetime-local", className: "border rounded p-2", value: form.dueDate ?? "", onChange: (e) => setForm({ ...form, dueDate: e.target.value }) }))] }), _jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded", children: "Salvar" })] }), message && _jsx("p", { className: "mt-4 text-sm text-gray-700", children: message }), errorCode && _jsxs("p", { className: "text-sm text-red-700", children: ["C\u00F3digo: ", errorCode] }), traceId && _jsxs("p", { className: "text-xs text-gray-500", children: ["traceId: ", traceId] })] }));
}
