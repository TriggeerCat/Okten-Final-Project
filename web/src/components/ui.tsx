import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700"
};

export function Button({
    variant = "primary",
    className = "",
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
    return (
        <button
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
            {...props}
        />
    );
}

const fieldClass =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
    return <input className={fieldClass} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
    return <select className={fieldClass} {...props} />;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase">{label}</span>
            {children}
        </label>
    );
}

export function Card({ title, children, className = "" }: { title?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={`rounded-lg bg-white p-4 shadow-sm ${className}`}>
            {title && <h2 className="mb-3 text-lg font-semibold">{title}</h2>}
            {children}
        </section>
    );
}

export function Alert({ error, success }: { error?: string | null; success?: string | null }) {
    if (error) return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
    if (success) return <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>;
    return null;
}

export function Loading() {
    return <p className="py-8 text-center text-slate-400">Loading...</p>;
}
