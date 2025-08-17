import React from "react";
import { Navigate } from "react-router-dom";
import { AppLayout } from "./AppLayout";

export function Protected({ children }: { children: React.ReactNode }) {
	const token = localStorage.getItem("panisul_token");
	if (!token) return <Navigate to="/login" replace />;
	return <AppLayout>{children}</AppLayout>;
}