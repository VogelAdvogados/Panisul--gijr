import React from "react";
import { Navigate } from "react-router-dom";

export function Protected({ children }: { children: React.ReactNode }) {
	const token = localStorage.getItem("panisul_token");
	if (!token) return <Navigate to="/login" replace />;
	return <>{children}</>;
}