import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from "react-router-dom";
export function AppLayout({ children }) {
    const navigate = useNavigate();
    function logout() {
        localStorage.removeItem("panisul_token");
        navigate("/login", { replace: true });
    }
    return (_jsxs("div", { className: "min-h-screen flex flex-col", children: [_jsx("header", { className: "bg-white border-b", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 py-3 flex items-center justify-between", children: [_jsxs("nav", { className: "flex items-center gap-4 text-sm", children: [_jsx(Link, { to: "/", className: "text-blue-700 hover:underline", children: "Vendas" }), _jsx(Link, { to: "/clients", className: "text-blue-700 hover:underline", children: "Clientes" }), _jsx(Link, { to: "/exchanges", className: "text-blue-700 hover:underline", children: "Trocas" }), _jsx(Link, { to: "/production", className: "text-blue-700 hover:underline", children: "Produ\u00E7\u00E3o" })] }), _jsx("button", { onClick: logout, className: "text-sm text-gray-700 hover:text-black", children: "Sair" })] }) }), _jsx("main", { className: "flex-1", children: children })] }));
}
