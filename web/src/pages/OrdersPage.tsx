import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { downloadFile, toQuery, useAction, useApi } from "../api";
import { FILTER_KEYS, type FilterKey, type Filters } from "../constants";
import type { Group, Order, Paginated } from "../types";
import { Alert, Loading } from "../components/ui";
import { Paginator } from "../components/Paginator";
import { FilterPanel } from "../components/FilterPanel";

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
    // section 5: the manager column shows the manager's surname
    if (column === "manager") return order.manager?.surname ?? "null";
    if (column === "group") return order.group?.name ?? "null";
    return String(value);
};

// filter panel + table + paginator; page, order and every filter live in the URL.
// TODO: expandable rows, comments, edit modal
export function OrdersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Math.floor(Number(searchParams.get("page"))) || 1);
    const order = searchParams.get("order") ?? "-id";

    const filters = useMemo(
        () => Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? ""])) as Filters,
        [searchParams]
    );
    const filterQuery = toQuery({ order, ...filters });

    const { data, error, loading, reload } = useApi<Paginated<Order>>(`/orders${toQuery({ page, order, ...filters })}`);
    const { data: groups } = useApi<Group[]>("/groups");
    const excel = useAction();

    // a link to a page past the end (e.g. after filtering) opens the last page instead of an empty table
    useEffect(() => {
        if (data && page > data.totalPages) {
            const next = new URLSearchParams(searchParams);
            next.set("page", String(data.totalPages));
            setSearchParams(next, { replace: true });
        }
    }, [data, page, searchParams, setSearchParams]);

    const setParam = (key: string, value: string | number) => {
        const next = new URLSearchParams(searchParams);
        next.set(key, String(value));
        setSearchParams(next);
    };

    // a new filter starts from page 1; replace keeps typing from filling the browser history.
    // Reads the live URL: react-router's updater sees the params of the last render, so two quick
    // changes (a debounced input firing right after a dropdown) would otherwise drop one of them
    const setFilter = useCallback(
        (key: FilterKey, value: string) => {
            const next = new URLSearchParams(window.location.search);
            if (value) next.set(key, value);
            else next.delete(key);
            next.delete("page");
            setSearchParams(next, { replace: true });
        },
        [setSearchParams]
    );

    // keeps the sort order, drops filters and page
    const resetFilters = () => {
        const next = new URLSearchParams();
        if (searchParams.has("order")) next.set("order", order);
        setSearchParams(next);
    };

    const exportExcel = () => excel.run(() => downloadFile(`/orders/excel${filterQuery}`, "orders.xlsx"));

    const toggleSort = (column: string) => {
        const next = new URLSearchParams(searchParams);
        next.set("order", order === column ? `-${column}` : column);
        next.delete("page");
        setSearchParams(next);
    };

    return (
        <div className="space-y-3">
            <FilterPanel
                filters={filters}
                groups={groups ?? []}
                onChange={setFilter}
                onReset={resetFilters}
                onRefresh={reload}
                onExport={exportExcel}
                exporting={excel.pending}
            />
            <Alert error={error ?? excel.error} />
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
                    <p className="py-8 text-center text-slate-400">
                        {Object.values(filters).some(Boolean)
                            ? "No orders match the filters."
                            : "No orders. Did you restore the dump?"}
                    </p>
                )}
            </div>

            {data && (
                <Paginator page={data.page} totalPages={data.totalPages} onChange={(p) => setParam("page", p)} />
            )}
        </div>
    );
}
