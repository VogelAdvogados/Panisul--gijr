import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { http } from "../../shared/http";
import { Link } from "react-router-dom";
export function ClientsListPage() {
    const [clients, setClients] = useState([]);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    async function load(p = 1, query = "") {
        const { data } = await http.get("/clients", { params: { page: p, q: query } });
        const resp = data?.data ?? { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
        setClients(resp.items);
        setPage(resp.page);
        setTotalPages(resp.totalPages);
    }
    useEffect(() => { load(); }, []);
    async function create(ev) {
        ev.preventDefault();
        setMsg("");
        if (!name || !phone) {
            setMsg("Nome e telefone são obrigatórios");
            return;
        }
        try {
            await http.post("/clients", { name, phone, email: email || undefined });
            setName("");
            setPhone("");
            setEmail("");
            await load(1, q);
            setMsg("Cliente criado");
        }
        catch (e) {
            setMsg(e?.response?.data?.message ?? "Erro ao criar cliente");
        }
    }
    function search(ev) {
        ev.preventDefault();
        load(1, q);
    }
    return (_jsxs("div", { className: "max-w-3xl mx-auto p-6 space-y-6", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Clientes" }), _jsxs("form", { onSubmit: create, className: "grid grid-cols-4 gap-2 items-end", children: [_jsx("input", { className: "col-span-2 border rounded p-2", placeholder: "Nome", value: name, onChange: (e) => setName(e.target.value) }), _jsx("input", { className: "col-span-1 border rounded p-2", placeholder: "Telefone", value: phone, onChange: (e) => setPhone(e.target.value) }), _jsx("input", { className: "col-span-1 border rounded p-2", placeholder: "E-mail (opcional)", value: email, onChange: (e) => setEmail(e.target.value) }), _jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded", children: "Adicionar" })] }), _jsxs("form", { onSubmit: search, className: "flex items-center gap-2", children: [_jsx("input", { className: "border rounded p-2", placeholder: "Buscar por nome/telefone/e-mail", value: q, onChange: (e) => setQ(e.target.value) }), _jsx("button", { className: "bg-gray-200 px-3 py-1 rounded", children: "Buscar" })] }), _jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "py-2", children: "Nome" }), _jsx("th", { children: "Telefone" }), _jsx("th", { children: "E-mail" }), _jsx("th", { children: "Cadastro" })] }) }), _jsxs("tbody", { children: [clients.map(c => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "py-2", children: _jsx(Link, { to: `/clients/${c.id}`, className: "text-blue-700 underline", children: c.name }) }), _jsx("td", { children: c.phone }), _jsx("td", { children: c.email ?? "-" }), _jsx("td", { children: new Date(c.createdAt).toLocaleString() })] }, c.id))), clients.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "py-4 text-center text-gray-500", children: "Nenhum cliente encontrado" }) }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { disabled: page <= 1, onClick: () => load(page - 1, q), className: "px-3 py-1 border rounded disabled:opacity-50", children: "Anterior" }), _jsxs("span", { className: "text-sm", children: ["P\u00E1gina ", page, " de ", totalPages] }), _jsx("button", { disabled: page >= totalPages, onClick: () => load(page + 1, q), className: "px-3 py-1 border rounded disabled:opacity-50", children: "Pr\u00F3xima" })] }), msg && _jsx("p", { className: "text-sm text-gray-700", children: msg })] }));
}
