import axios, { AxiosError, AxiosResponse } from "axios";
import { v4 as uuid } from "uuid";
import { ENV } from "./env";

const traceId = uuid();

export const http = axios.create({
	baseURL: ENV.API_BASE,
	headers: { "x-trace-id": traceId },
	timeout: 10000
});

// Helper function to safely access localStorage
function getToken(): string | null {
	try {
		return localStorage.getItem("panisul_token");
	} catch (error) {
		console.warn("Failed to access localStorage:", error);
		return null;
	}
}

// Helper function to safely remove token
function removeToken(): void {
	try {
		localStorage.removeItem("panisul_token");
	} catch (error) {
		console.warn("Failed to remove token from localStorage:", error);
	}
}

// Helper function to validate JWT token format
function isValidToken(token: string): boolean {
	// Basic JWT format validation (header.payload.signature)
	const parts = token.split('.');
	return parts.length === 3 && parts.every(part => part.length > 0);
}

http.interceptors.request.use((config) => {
	const token = getToken();
	if (token && isValidToken(token)) {
		config.headers = config.headers ?? {};
		(config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
	}
	return config;
});

http.interceptors.response.use(
	(response: AxiosResponse) => response,
	(error: AxiosError) => {
		const status = error.response?.status;
		const data = error.response?.data as any;
		
		// Log error for debugging
		console.error("API error", {
			status,
			message: data?.message || error.message,
			url: error.config?.url,
			method: error.config?.method
		});

		// Handle authentication errors
		if (status === 401 || status === 403) {
			removeToken();
			
			if (typeof window !== "undefined" && window.location.pathname !== "/login") {
				window.location.href = "/login";
			}
		}

		// Handle rate limiting
		if (status === 429) {
			console.warn("Rate limit exceeded, please try again later");
		}

		// Handle server errors
		if (status && status >= 500) {
			console.error("Server error occurred");
		}

		return Promise.reject(error);
	}
);

// Helper function to handle API responses
export function handleApiResponse<T>(response: AxiosResponse<T>) {
	return response.data;
}

// Helper function to handle API errors
export function handleApiError(error: AxiosError) {
	const data = error.response?.data as any;
	return {
		message: data?.message || error.message || "Erro desconhecido",
		status: error.response?.status,
		errors: data?.errors || []
	};
}