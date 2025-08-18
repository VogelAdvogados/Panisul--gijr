import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { http } from "../../shared/http";
export function ExchangesPage() {
    const [clients, setClients] = useState([]);
    const [clientId, setClientId] = useState("");
    const [inItems, setInItems] = useState([{ productId: "", quantity: 1 }]);
    const [outItems, setOutItems] = useState([{ productId: "", quantity: 1 }]);
    const [products, setProducts] = useState([]);
    const [msg, setMsg] = useState("");
    useEffect(() => {
        (async () => {
            const [pc, pp] = await Promise.all([http.get("/clients"), http.get("/products")]);
            setClients((pc.data?.data ?? []).map((c) => ({ id: c.id, name: c.name })));
            setProducts((pp.data?.data ?? []).map((p) => ({ id: p.id, name: p.name })));
        })();
    }, []);
    function setIn(idx, key, val) {
        setInItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: key === "quantity" ? Number(val) : val } : it));
    }
    function addIn() { setInItems(prev => [...prev, { productId: "", quantity: 1 }]); }
    function setOut(idx, key, val) {
        setOutItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: key === "quantity" ? Number(val) : val } : it));
    }
    function addOut() { setOutItems(prev => [...prev, { productId: "", quantity: 1 }]); }
    async function submit(ev) {
        ev.preventDefault();
        setMsg("");
        try {
            await http.post("/exchanges", { clientId: clientId || undefined, inItems, outItems });
            setMsg("Troca registrada");
        }
        catch (e) {
            setMsg(e?.response?.data?.message ?? "Erro ao registrar troca");
        }
    }
    return (_jsxs("div", { className: "max-w-3xl mx-auto p-6 space-y-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Trocas" }), _jsxs("form", { onSubmit: submit, className: "space-y-4", children: [_jsx("div", { className: "flex gap-2 items-center", children: _jsxs("select", { className: "border rounded p-2", value: clientId, onChange: (e) => setClientId(e.target.value), children: [_jsx("option", { value: "", children: "Cliente (opcional)" }), clients.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-medium", children: "Entradas" }), inItems.map((it, idx) => (_jsxs("div", { className: "grid grid-cols-6 gap-2 items-center", children: [_jsxs("select", { className: "col-span-4 border rounded p-2", value: it.productId, onChange: (e) => setIn(idx, "productId", e.target.value), children: [_jsx("option", { value: "", children: "Produto" }), products.map(p => _jsx("option", { value: p.id, children: p.name }, p.id))] }), _jsx("input", { type: "number", className: "col-span-2 border rounded p-2", value: it.quantity, onChange: (e) => setIn(idx, "quantity", e.target.value) })] }, idx))), _jsx("button", { type: "button", className: "bg-gray-200 px-3 py-1 rounded", onClick: addIn, children: "+ Adicionar" })] }), _jsxs("div", { children: [_jsx("h2", { className: "font-medium", children: "Sa\u00EDdas" }), outItems.map((it, idx) => (_jsxs("div", { className: "grid grid-cols-6 gap-2 items-center", children: [_jsxs("select", { className: "col-span-4 border rounded p-2", value: it.productId, onChange: (e) => setOut(idx, "productId", e.target.value), children: [_jsx("option", { value: "", children: "Produto" }), products.map(p => _jsx("option", { value: p.id, children: p.name }, p.id))] }), _jsx("input", { type: "number", className: "col-span-2 border rounded p-2", value: it.quantity, onChange: (e) => setOut(idx, "quantity", e.target.value) })] }, idx))), _jsx("button", { type: "button", className: "bg-gray-200 px-3 py-1 rounded", onClick: addOut, children: "+ Adicionar" })] }), _jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded", children: "Salvar" })] }), msg && _jsx("p", { className: "text-sm text-gray-700", children: msg })] }));
}
