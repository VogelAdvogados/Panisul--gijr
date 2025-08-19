import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http, handleApiError } from "../../shared/http";
export function LoginPage() {
    const [email, setEmail] = useState("admin@panisul.local");
    const [password, setPassword] = useState("admin123");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    async function submit(ev) {
        ev.preventDefault();
        setMessage("");
        setError("");
        setIsLoading(true);
        try {
            const { data } = await http.post("/auth/login", { email, password });
            const token = data?.data?.token;
            if (token) {
                localStorage.setItem("panisul_token", token);
                setMessage("Logado com sucesso! Redirecionando...");
                setTimeout(() => navigate("/"), 1000);
            }
            else {
                setError("Erro ao processar resposta do servidor");
            }
        }
        catch (err) {
            const errorInfo = handleApiError(err);
            setError(errorInfo.message);
            // Show specific error for rate limiting
            if (errorInfo.status === 429) {
                setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
            }
        }
        finally {
            setIsLoading(false);
        }
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "max-w-md w-full space-y-8", children: [_jsx("div", { children: _jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Login PaniSul" }) }), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: submit, children: [_jsxs("div", { className: "rounded-md shadow-sm -space-y-px", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "sr-only", children: "E-mail" }), _jsx("input", { id: "email", name: "email", type: "email", required: true, className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm", placeholder: "E-mail", value: email, onChange: (e) => setEmail(e.target.value), disabled: isLoading })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "sr-only", children: "Senha" }), _jsx("input", { id: "password", name: "password", type: "password", required: true, className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm", placeholder: "Senha", value: password, onChange: (e) => setPassword(e.target.value), disabled: isLoading })] })] }), _jsx("div", { children: _jsxs("button", { type: "submit", disabled: isLoading, className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: [isLoading ? (_jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })) : null, isLoading ? "Entrando..." : "Entrar"] }) }), message && (_jsx("div", { className: "rounded-md bg-green-50 p-4", children: _jsx("div", { className: "flex", children: _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm font-medium text-green-800", children: message }) }) }) })), error && (_jsx("div", { className: "rounded-md bg-red-50 p-4", children: _jsx("div", { className: "flex", children: _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm font-medium text-red-800", children: error }) }) }) }))] })] }) }));
}
