import axios from "axios";
import { v4 as uuid } from "uuid";
import { ENV } from "./env";

const traceId = uuid();

export const http = axios.create({
	baseURL: ENV.API_BASE,
	headers: { "x-trace-id": traceId }
});

http.interceptors.request.use((config) => {
	const token = localStorage.getItem("panisul_token");
	if (token) {
		config.headers = config.headers ?? {};
		(config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
	}
	return config;
});

http.interceptors.response.use(
	(r) => r,
	(err) => {
		// eslint-disable-next-line no-console
		console.error("API error", err?.response?.data || err.message);
		const status = err?.response?.status;
		if (status === 401 || status === 403) {
			try {
				localStorage.removeItem("panisul_token");
			} catch {}
			if (typeof window !== "undefined" && window.location.pathname !== "/login") {
				window.location.href = "/login";
			}
		}
		return Promise.reject(err);
	}
);