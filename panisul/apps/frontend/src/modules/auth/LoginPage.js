import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { http } from "../../shared/http";
export function LoginPage() {
    const [email, setEmail] = useState("admin@panisul.local");
    const [password, setPassword] = useState("admin123");
    const [message, setMessage] = useState("");
    async function submit(ev) {
        ev.preventDefault();
        setMessage("");
        try {
            const { data } = await http.post("/auth/login", { email, password });
            const token = data?.data?.token;
            if (token) {
                localStorage.setItem("panisul_token", token);
                setMessage("Logado com sucesso");
            }
            else {
                setMessage("Erro ao logar");
            }
        }
        catch (e) {
            setMessage(e?.response?.data?.message ?? "Erro");
        }
    }
    return (_jsxs("div", { className: "max-w-sm mx-auto p-6", children: [_jsx("h1", { className: "text-2xl font-semibold mb-4", children: "Login" }), _jsxs("form", { onSubmit: submit, className: "space-y-3", children: [_jsx("input", { className: "w-full border rounded p-2", placeholder: "E-mail", value: email, onChange: (e) => setEmail(e.target.value) }), _jsx("input", { type: "password", className: "w-full border rounded p-2", placeholder: "Senha", value: password, onChange: (e) => setPassword(e.target.value) }), _jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded", children: "Entrar" })] }), message && _jsx("p", { className: "mt-4 text-sm", children: message })] }));
}
