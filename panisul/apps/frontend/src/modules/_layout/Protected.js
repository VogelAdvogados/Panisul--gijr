import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { AppLayout } from "./AppLayout";
export function Protected({ children }) {
    const token = localStorage.getItem("panisul_token");
    if (!token)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(AppLayout, { children: children });
}
