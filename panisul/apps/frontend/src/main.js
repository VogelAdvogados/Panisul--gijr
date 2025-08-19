import { jsx as _jsx } from "react/jsx-runtime";
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
    { path: "/", element: _jsx(Protected, { children: _jsx(SalesPage, {}) }) },
    { path: "/login", element: _jsx(LoginPage, {}) },
    { path: "/clients", element: _jsx(Protected, { children: _jsx(ClientsListPage, {}) }) },
    { path: "/clients/:id", element: _jsx(Protected, { children: _jsx(ClientDetailPage, {}) }) },
    { path: "/exchanges", element: _jsx(Protected, { children: _jsx(ExchangesPage, {}) }) },
    { path: "/production", element: _jsx(Protected, { children: _jsx(ProductionPage, {}) }) }
]);
const queryClient = new QueryClient();
createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(RouterProvider, { router: router }) }) }));
