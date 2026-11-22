// paginator from section 4.1:
//   page 1:            [1] 2 3 4 5 6 7 … 20 >
//   first half:      < 1 2 3 [4] 5 6 7 … 20 >
//   second half:     < 1 … 14 15 16 17 [18] 19 20 >
//   last page:       < 1 … 14 15 16 17 18 19 [20]
// a window of WINDOW pages slides with the current page, the first and last pages are always shown

const WINDOW = 7;

export type PaginatorItem =
    | { type: "page"; page: number }
    // jumps a whole window back or forward
    | { type: "gap"; page: number; key: "gap-start" | "gap-end" };

export function getPaginatorItems(page: number, totalPages: number): PaginatorItem[] {
    // a gap that hides a single page is pointless, so up to WINDOW + 2 pages are shown in full
    if (totalPages <= WINDOW + 2) {
        return Array.from({ length: totalPages }, (_, i) => ({ type: "page", page: i + 1 }));
    }

    const start = Math.min(Math.max(page - Math.floor(WINDOW / 2), 1), totalPages - WINDOW + 1);
    const end = start + WINDOW - 1;
    const items: PaginatorItem[] = [];

    // a gap that would hide just one page shows that page instead
    if (start > 1) items.push({ type: "page", page: 1 });
    if (start === 3) items.push({ type: "page", page: 2 });
    if (start > 3) items.push({ type: "gap", page: Math.max(page - WINDOW, 1), key: "gap-start" });
    for (let p = start; p <= end; p++) items.push({ type: "page", page: p });
    if (end === totalPages - 2) items.push({ type: "page", page: totalPages - 1 });
    if (end < totalPages - 2) items.push({ type: "gap", page: Math.min(page + WINDOW, totalPages), key: "gap-end" });
    if (end < totalPages) items.push({ type: "page", page: totalPages });

    return items;
}

const circle =
    "flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-semibold text-white transition";

interface PaginatorProps {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
}

export function Paginator({ page, totalPages, onChange }: PaginatorProps) {
    if (totalPages <= 1) return null;

    const button = (label: string, target: number, key: string, title?: string) => (
        <button
            key={key}
            type="button"
            title={title}
            onClick={() => onChange(target)}
            className={`${circle} bg-green-500 hover:bg-green-600`}
        >
            {label}
        </button>
    );

    return (
        <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
            {page > 1 && button("<", page - 1, "prev", "Previous page")}
            {getPaginatorItems(page, totalPages).map((item) => {
                if (item.type === "gap") return button("…", item.page, item.key, `Page ${item.page}`);
                if (item.page === page) {
                    return (
                        <span key={item.page} aria-current="page" className={`${circle} bg-green-800`}>
                            {item.page}
                        </span>
                    );
                }
                return button(String(item.page), item.page, String(item.page));
            })}
            {page < totalPages && button(">", page + 1, "next", "Next page")}
        </nav>
    );
}
