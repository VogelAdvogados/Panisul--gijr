import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { http } from "../../shared/http";
export function ClientDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tab, setTab] = useState("overview");
    const [client, setClient] = useState(null);
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState(null);
    const [msg, setMsg] = useState("");
    const [receivables, setReceivables] = useState([]);
    const [sales, setSales] = useState([]);
    const [exchanges, setExchanges] = useState([]);
    const load = useCallback(async () => {
        const { data } = await http.get(`/clients/${id}`);
        setClient(data?.data ?? null);
        if (data?.data)
            setForm({ name: data.data.name, phone: data.data.phone, email: data.data.email ?? "" });
    }, [id]);
    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        if (tab === "financeiro")
            (async () => {
                const { data } = await http.get(`/clients/${id}/receivables`);
                setReceivables(data?.data ?? []);
            })();
        if (tab === "compras")
            (async () => {
                const { data } = await http.get(`/clients/${id}/sales`);
                setSales(data?.data ?? []);
            })();
        if (tab === "trocas")
            (async () => {
                const { data } = await http.get(`/clients/${id}/exchanges`);
                setExchanges(data?.data ?? []);
            })();
    }, [tab, id]);
    async function save() {
        setMsg("");
        if (!form?.name || !form?.phone) {
            setMsg("Nome e telefone são obrigatórios");
            return;
        }
        await http.put(`/clients/${id}`, { name: form.name, phone: form.phone, email: form.email || undefined });
        setEdit(false);
        await load();
        setMsg("Cliente atualizado");
    }
    async function removeClient() {
        if (!confirm("Tem certeza que deseja remover este cliente?"))
            return;
        await http.delete(`/clients/${id}`);
        navigate("/clients", { replace: true });
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6 space-y-4", children: [_jsx(Link, { to: "/clients", className: "text-blue-700 underline", children: "\u2190 Voltar" }), client && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-semibold", children: client.name }), _jsxs("div", { className: "flex items-center gap-2", children: [!edit && _jsx("button", { className: "text-sm px-3 py-1 border rounded", onClick: () => setEdit(true), children: "Editar" }), _jsx("button", { className: "text-sm px-3 py-1 border rounded text-red-700", onClick: removeClient, children: "Remover" })] })] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Cadastrado em ", new Date(client.createdAt).toLocaleString()] }), edit ? (_jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsx("input", { className: "border rounded p-2", placeholder: "Nome", value: form?.name ?? "", onChange: (e) => setForm(s => ({ ...s, name: e.target.value })) }), _jsx("input", { className: "border rounded p-2", placeholder: "Telefone", value: form?.phone ?? "", onChange: (e) => setForm(s => ({ ...s, phone: e.target.value })) }), _jsx("input", { className: "border rounded p-2", placeholder: "E-mail (opcional)", value: form?.email ?? "", onChange: (e) => setForm(s => ({ ...s, email: e.target.value })) }), _jsxs("div", { className: "col-span-3 flex items-center gap-2", children: [_jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded", onClick: save, children: "Salvar" }), _jsx("button", { className: "px-4 py-2 rounded border", onClick: () => setEdit(false), children: "Cancelar" })] }), msg && _jsx("p", { className: "text-sm text-gray-700", children: msg })] })) : (_jsxs("p", { className: "text-sm text-gray-700", children: ["Telefone: ", client.phone, " \u00B7 Email: ", client.email ?? "-"] }))] })), _jsxs("div", { className: "flex gap-2 border-b", children: [_jsx("button", { className: `px-3 py-2 ${tab === "overview" ? "border-b-2 border-blue-600" : ""}`, onClick: () => setTab("overview"), children: "Ficha" }), _jsx("button", { className: `px-3 py-2 ${tab === "financeiro" ? "border-b-2 border-blue-600" : ""}`, onClick: () => setTab("financeiro"), children: "Financeiro" }), _jsx("button", { className: `px-3 py-2 ${tab === "compras" ? "border-b-2 border-blue-600" : ""}`, onClick: () => setTab("compras"), children: "Hist\u00F3rico de compras" }), _jsx("button", { className: `px-3 py-2 ${tab === "trocas" ? "border-b-2 border-blue-600" : ""}`, onClick: () => setTab("trocas"), children: "Hist\u00F3rico de trocas" })] }), tab === "overview" && client && !edit && (_jsxs("div", { className: "space-y-1", children: [_jsxs("p", { children: [_jsx("strong", { children: "Nome:" }), " ", client.name] }), _jsxs("p", { children: [_jsx("strong", { children: "Telefone:" }), " ", client.phone] }), _jsxs("p", { children: [_jsx("strong", { children: "E-mail:" }), " ", client.email ?? "-"] })] })), tab === "financeiro" && (_jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "py-2", children: "Vencimento" }), _jsx("th", { children: "Valor" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Venda" })] }) }), _jsx("tbody", { children: receivables.map(r => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "py-2", children: new Date(r.dueDate).toLocaleDateString() }), _jsx("td", { children: r.amount.toFixed(2) }), _jsx("td", { children: r.status }), _jsx("td", { children: _jsx(Link, { className: "text-blue-700 underline", to: `/sales/${r.saleId}`, children: r.saleId }) })] }, r.id))) })] })), tab === "compras" && (_jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "py-2", children: "Data" }), _jsx("th", { children: "Valor total" }), _jsx("th", { children: "Pagamento" })] }) }), _jsx("tbody", { children: sales.map(s => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "py-2", children: new Date(s.createdAt).toLocaleString() }), _jsx("td", { children: s.totalValue.toFixed(2) }), _jsx("td", { children: s.paymentType })] }, s.id))) })] })), tab === "trocas" && (_jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "py-2", children: "Data" }), _jsx("th", { children: "Itens" })] }) }), _jsx("tbody", { children: exchanges.map(e => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "py-2", children: new Date(e.createdAt).toLocaleString() }), _jsx("td", { children: e.items.map(i => `${i.direction === "IN" ? "+" : "-"}${i.quantity}(${i.productId})`).join(", ") })] }, e.id))) })] }))] }));
}
