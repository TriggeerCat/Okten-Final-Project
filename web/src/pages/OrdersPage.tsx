import { useSearchParams } from "react-router";
import { toQuery, useApi } from "../api";
import type { Order, Paginated } from "../types";
import { Alert, Button, Loading } from "../components/ui";

const COLUMNS: (keyof Order)[] = [
    "id",
    "name",
    "surname",
    "email",
    "phone",
    "age",
    "course",
    "course_format",
    "course_type",
    "status",
    "sum",
    "alreadyPaid",
    "created_at",
    "manager",
    "group"
];

const formatCell = (order: Order, column: keyof Order) => {
    const value = order[column];
    if (value === null || value === undefined) return "null";
    if (column === "created_at") return new Date(String(value)).toLocaleDateString("uk-UA");
    return String(value);
};

// base version: table + ?page + ?order. TODO: filters, expandable rows, comments, edit modal, excel
export function OrdersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const order = searchParams.get("order") ?? "-id";

    const { data, error, loading } = useApi<Paginated<Order>>(`/orders${toQuery({ page, order })}`);

    const setParam = (key: string, value: string | number) => {
        const next = new URLSearchParams(searchParams);
        next.set(key, String(value));
        setSearchParams(next);
    };

    const toggleSort = (column: string) => {
        const next = new URLSearchParams(searchParams);
        next.set("order", order === column ? `-${column}` : column);
        next.delete("page");
        setSearchParams(next);
    };

    return (
        <div className="space-y-3">
            <Alert error={error} />
            <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-green-600 text-white">
                        <tr>
                            {COLUMNS.map((column) => (
                                <th
                                    key={column}
                                    onClick={() => toggleSort(column)}
                                    className="cursor-pointer px-2 py-2 whitespace-nowrap select-none"
                                >
                                    {column}
                                    {order === column && " ▲"}
                                    {order === `-${column}` && " ▼"}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((row) => (
                            <tr key={row._id} className="border-t border-slate-100 odd:bg-slate-50">
                                {COLUMNS.map((column) => (
                                    <td key={column} className="px-2 py-1.5 whitespace-nowrap">
                                        {formatCell(row, column)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <Loading />}
                {!loading && data?.data.length === 0 && (
                    <p className="py-8 text-center text-slate-400">No orders. Did you restore the dump?</p>
                )}
            </div>

            {/* TODO: paginator with the 4 visual modes from section 4.1 */}
            {data && (
                <div className="flex items-center justify-center gap-2">
                    <Button variant="secondary" disabled={page <= 1} onClick={() => setParam("page", page - 1)}>
                        Prev
                    </Button>
                    <span className="text-sm">
                        {data.page} / {data.totalPages}
                    </span>
                    <Button
                        variant="secondary"
                        disabled={page >= data.totalPages}
                        onClick={() => setParam("page", page + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
