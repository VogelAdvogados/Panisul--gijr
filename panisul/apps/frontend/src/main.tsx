import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles.css";
import { SalesPage } from "./modules/vendas/SalesPage";
import { LoginPage } from "./modules/auth/LoginPage";

const router = createBrowserRouter([
	{ path: "/", element: <SalesPage /> },
	{ path: "/login", element: <LoginPage /> }
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</React.StrictMode>
);