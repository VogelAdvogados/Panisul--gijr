import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles.css";
import { SalesPage } from "./modules/vendas/SalesPage";
import { LoginPage } from "./modules/auth/LoginPage";
import { Protected } from "./modules/_layout/Protected";
import { ClientsListPage } from "./modules/clientes/ClientsListPage";
import { ClientDetailPage } from "./modules/clientes/ClientDetailPage";
import { ExchangesPage } from "./modules/exchanges/ExchangesPage";
import { ProductionPage } from "./modules/producao/ProductionPage";

const router = createBrowserRouter([
	{ path: "/", element: <Protected><SalesPage /></Protected> },
	{ path: "/login", element: <LoginPage /> },
	{ path: "/clients", element: <Protected><ClientsListPage /></Protected> },
	{ path: "/clients/:id", element: <Protected><ClientDetailPage /></Protected> },
	{ path: "/exchanges", element: <Protected><ExchangesPage /></Protected> },
	{ path: "/production", element: <Protected><ProductionPage /></Protected> }
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</React.StrictMode>
);