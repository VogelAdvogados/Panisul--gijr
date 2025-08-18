import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { http } from "../../shared/http";
import { CreateProductionDTO } from "@panisul/contracts/v1/producao";
export function ProductionPage() {
    const [products, setProducts] = useState([]);
    const [outputs, setOutputs] = useState([{ productId: "", quantity: 1 }]);
    const [consumption, setConsumption] = useState([]);
    const [msg, setMsg] = useState("");
    const [traceId, setTraceId] = useState("");
    const [errors, setErrors] = useState([]);
    useEffect(() => {
        (async () => {
            const { data } = await http.get("/products");
            setProducts((data?.data ?? []).map((p) => ({ id: p.id, name: p.name, stockQty: p.stockQty })));
        })();
    }, []);
    const totalOutputs = useMemo(() => outputs.reduce((s, it) => s + (Number(it.quantity) || 0), 0), [outputs]);
    const totalConsumption = useMemo(() => consumption.reduce((s, it) => s + (Number(it.quantity) || 0), 0), [consumption]);
    function setOut(idx, key, val) {
        setOutputs(prev => prev.map((it, i) => i === idx ? { ...it, [key]: key === "quantity" ? Number(val) : val } : it));
    }
    function addOut() { setOutputs(prev => [...prev, { productId: "", quantity: 1 }]); }
    function removeOut(idx) { setOutputs(prev => prev.filter((_, i) => i !== idx)); }
    function setCons(idx, key, val) {
        setConsumption(prev => prev.map((it, i) => i === idx ? { ...it, [key]: key === "quantity" ? Number(val) : val } : it));
    }
    function addCons() { setConsumption(prev => [...prev, { productId: "", quantity: 1 }]); }
    function removeCons(idx) { setConsumption(prev => prev.filter((_, i) => i !== idx)); }
    function getProduct(pid) {
        return products.find(p => p.id === pid);
    }
    function validateForm() {
        const errs = [];
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
    async function submit(ev) {
        ev.preventDefault();
        setMsg("");
        setTraceId("");
        setErrors([]);
        const { errs, cleanedOutputs, cleanedConsumption } = validateForm();
        if (errs.length) {
            setErrors(errs);
            return;
        }
        try {
            const res = await http.post("/production", { outputs: cleanedOutputs, consumption: cleanedConsumption });
            setMsg(res.data?.message ?? "Produção registrada");
            setTraceId(res.headers["x-trace-id"] ?? "");
            setOutputs([{ productId: "", quantity: 1 }]);
            setConsumption([]);
        }
        catch (e) {
            setMsg(e?.response?.data?.message ?? "Erro ao registrar produção");
            setTraceId(e?.response?.headers?.["x-trace-id"] ?? "");
        }
    }
    return (_jsxs("div", { className: "max-w-3xl mx-auto p-6 space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Produ\u00E7\u00E3o" }), _jsxs("form", { onSubmit: submit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-medium mb-2", children: "Sa\u00EDdas" }), outputs.map((it, idx) => (_jsxs("div", { className: "grid grid-cols-8 gap-2 items-center", children: [_jsxs("select", { className: "col-span-5 border rounded p-2", value: it.productId, onChange: (e) => setOut(idx, "productId", e.target.value), children: [_jsx("option", { value: "", children: "Produto" }), products.map(p => _jsx("option", { value: p.id, children: p.name }, p.id))] }), _jsx("input", { type: "number", min: 1, className: "col-span-2 border rounded p-2", value: it.quantity, onChange: (e) => setOut(idx, "quantity", e.target.value) }), _jsx("button", { type: "button", className: "col-span-1 bg-red-600 text-white px-2 py-2 rounded", onClick: () => removeOut(idx), children: "Remover" })] }, idx))), _jsx("button", { type: "button", className: "bg-gray-200 px-3 py-1 rounded", onClick: addOut, children: "+ Adicionar" }), _jsxs("p", { className: "text-xs text-gray-600 mt-1", children: ["Total de sa\u00EDdas: ", totalOutputs] })] }), _jsxs("div", { children: [_jsx("h2", { className: "font-medium mb-2", children: "Consumo" }), consumption.map((it, idx) => {
                                const p = getProduct(it.productId);
                                const warn = p && it.quantity > p.stockQty;
                                return (_jsxs("div", { className: "grid grid-cols-8 gap-2 items-center", children: [_jsxs("select", { className: `col-span-5 border rounded p-2 ${warn ? "border-red-500" : ""}`, value: it.productId, onChange: (e) => setCons(idx, "productId", e.target.value), children: [_jsx("option", { value: "", children: "Produto" }), products.map(p => _jsx("option", { value: p.id, children: p.name }, p.id))] }), _jsx("input", { type: "number", min: 1, className: `col-span-2 border rounded p-2 ${warn ? "border-red-500" : ""}`, value: it.quantity, onChange: (e) => setCons(idx, "quantity", e.target.value) }), _jsx("button", { type: "button", className: "col-span-1 bg-red-600 text-white px-2 py-2 rounded", onClick: () => removeCons(idx), children: "Remover" }), p && (_jsxs("p", { className: `col-span-8 text-xs ${warn ? "text-red-600" : "text-gray-600"}`, children: ["Estoque atual: ", p.stockQty] }))] }, idx));
                            }), _jsx("button", { type: "button", className: "bg-gray-200 px-3 py-1 rounded", onClick: addCons, children: "+ Adicionar" }), _jsxs("p", { className: "text-xs text-gray-600 mt-1", children: ["Total de consumo: ", totalConsumption] })] }), errors.length > 0 && (_jsx("ul", { className: "list-disc list-inside text-sm text-red-700", children: errors.map((e, i) => _jsx("li", { children: e }, i)) })), _jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded", children: "Salvar" })] }), msg && _jsx("p", { className: "text-sm text-gray-700", children: msg }), traceId && _jsxs("p", { className: "text-xs text-gray-500", children: ["traceId: ", traceId] })] }));
}
