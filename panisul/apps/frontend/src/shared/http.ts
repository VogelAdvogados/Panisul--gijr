import axios from "axios";
import { v4 as uuid } from "uuid";

const traceId = uuid();

export const http = axios.create({
	baseURL: "/api/v1",
	headers: { "x-trace-id": traceId }
});

http.interceptors.response.use(
	(r) => r,
	(err) => {
		// eslint-disable-next-line no-console
		console.error("API error", err?.response?.data || err.message);
		return Promise.reject(err);
	}
);