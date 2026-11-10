import { useParams } from "react-router";
import { Card } from "../components/ui";

// TODO (section 11): Password + Confirm Password form, POST to /auth/activate/:token, then redirect to /login
export function ActivatePage() {
    const { token } = useParams();

    return (
        <Card title="Activate account" className="mx-auto max-w-sm">
            <p className="text-sm break-all text-slate-500">Token: {token}</p>
        </Card>
    );
}
