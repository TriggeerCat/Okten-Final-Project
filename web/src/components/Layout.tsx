import { Link, Outlet, useNavigate } from "react-router";
import { useAuth } from "../auth";
import { Button } from "./ui";

// header from section 9: logo, current user, admin panel (admins only), logout
export function Layout() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const logout = async () => {
        await signOut();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen">
            <header className="bg-green-600 text-white">
                <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3">
                    <Link to="/orders" className="text-lg font-bold">
                        CRM Programming School
                    </Link>
                    {user && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm">{user.name}</span>
                            {user.role === "admin" && (
                                <Button variant="secondary" onClick={() => navigate("/admin")}>
                                    Admin
                                </Button>
                            )}
                            <Button variant="secondary" onClick={logout}>
                                Logout
                            </Button>
                        </div>
                    )}
                </div>
            </header>
            <main className="mx-auto max-w-screen-2xl p-4">
                <Outlet />
            </main>
        </div>
    );
}
