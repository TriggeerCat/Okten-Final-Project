import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "./index.css";
import { AuthProvider, useAuth } from "./auth";
import type { Role } from "./types";
import { Layout } from "./components/Layout";
import { Loading } from "./components/ui";
import { LoginPage } from "./pages/LoginPage";
import { OrdersPage } from "./pages/OrdersPage";
import { AdminPage } from "./pages/AdminPage";
import { ActivatePage } from "./pages/ActivatePage";

function RequireAuth({ children, role }: { children: ReactNode; role?: Role }) {
    const { user, loading } = useAuth();
    if (loading) return <Loading />;
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) return <Navigate to="/orders" replace />;
    return children;
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="login" element={<LoginPage />} />
                        <Route path="activate/:token" element={<ActivatePage />} />
                        <Route path="orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
                        <Route path="admin" element={<RequireAuth role="admin"><AdminPage /></RequireAuth>} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>
);
