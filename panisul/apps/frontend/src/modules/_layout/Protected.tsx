import React from "react";
import { Navigate } from "react-router-dom";
import { AppLayout } from "./AppLayout";

// Helper function to safely access localStorage
function getToken(): string | null {
	try {
		return localStorage.getItem("panisul_token");
	} catch (error) {
		console.warn("Failed to access localStorage:", error);
		return null;
	}
}

// Helper function to validate JWT token format
function isValidToken(token: string): boolean {
	// Basic JWT format validation (header.payload.signature)
	const parts = token.split('.');
	return parts.length === 3 && parts.every(part => part.length > 0);
}

export function Protected({ children }: { children: React.ReactNode }) {
	const token = getToken();
	
	if (!token || !isValidToken(token)) {
		return <Navigate to="/login" replace />;
	}
	
	return <AppLayout>{children}</AppLayout>;
}