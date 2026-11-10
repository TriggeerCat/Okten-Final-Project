import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import { useAuth } from "../auth";
import { useAction } from "../api";
import { Alert, Button, Card, Field, Input } from "../components/ui";

export function LoginPage() {
    const { user, signIn } = useAuth();
    const navigate = useNavigate();
    const { pending, error, run } = useAction();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    if (user) return <Navigate to="/orders" replace />;

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        await run(async () => {
            await signIn(email, password);
            navigate("/orders", { replace: true });
        });
    };

    return (
        <div className="flex min-h-[70vh] items-center justify-center">
            <Card className="w-full max-w-sm">
                <form onSubmit={submit} className="space-y-3">
                    <Field label="Email">
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </Field>
                    <Field label="Password">
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </Field>
                    <Alert error={error} />
                    <Button type="submit" className="w-full" disabled={pending}>
                        Login
                    </Button>
                </form>
            </Card>
        </div>
    );
}
