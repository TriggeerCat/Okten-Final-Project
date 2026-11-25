import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { COURSE_FORMATS, COURSE_TYPES, COURSES, ORDER_STATUSES, type FilterKey, type Filters } from "../constants";
import type { Group } from "../types";
import { Button } from "./ui";

const DEBOUNCE_MS = 500;

const fieldClass =
    "w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-green-500 focus:outline-none";

// keeps what the user types locally and reports it once they stop typing,
// so the URL and the request don't change on every key press
function DebouncedInput({
    value,
    onChange,
    ...props
}: { value: string; onChange: (value: string) => void } & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
    const [text, setText] = useState(value);
    // the parent passes a new function on every render; that must not restart the timer
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // the URL changed from outside (reset, back button): show the new value
    useEffect(() => setText(value), [value]);

    useEffect(() => {
        if (text === value) return;
        const timer = setTimeout(() => onChangeRef.current(text), DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [text, value]);

    return <input className={fieldClass} value={text} onChange={(e) => setText(e.target.value)} {...props} />;
}

function OptionSelect({
    value,
    onChange,
    placeholder,
    options
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: readonly string[];
}) {
    // a value from the URL that isn't in the list (e.g. a deleted group) is still shown, so the filter is visible
    const all = value && !options.includes(value) ? [value, ...options] : options;
    return (
        <select
            className={`${fieldClass} ${value ? "" : "text-slate-400"}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={placeholder}
        >
            <option value="">{placeholder}</option>
            {all.map((option) => (
                <option key={option} value={option} className="text-slate-900">
                    {option}
                </option>
            ))}
        </select>
    );
}

interface FilterPanelProps {
    filters: Filters;
    groups: Group[];
    onChange: (key: FilterKey, value: string) => void;
    onReset: () => void;
    onRefresh: () => void;
    onExport: () => void;
    exporting: boolean;
}

// section 8: Name, Surname, Email, Phone, Age, Course, Course format, Course type, Status, Group,
// Start date, End date; My checkbox; reset, refresh and Excel buttons
export function FilterPanel({ filters, groups, onChange, onReset, onRefresh, onExport, exporting }: FilterPanelProps) {
    const text = (key: FilterKey, placeholder: string, type = "text") => (
        <DebouncedInput
            type={type}
            placeholder={placeholder}
            aria-label={placeholder}
            value={filters[key]}
            // not trimmed here: "ab " would never equal the URL value "ab" and keep re-sending; the API trims
            onChange={(value) => onChange(key, value)}
            {...(type === "number" ? { min: 0, max: 150 } : {})}
        />
    );

    const select = (key: FilterKey, placeholder: string, options: readonly string[]) => (
        <OptionSelect
            value={filters[key]}
            onChange={(value) => onChange(key, value)}
            placeholder={placeholder}
            options={options}
        />
    );

    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <div className="flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm lg:flex-row">
            <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                {text("name", "Name")}
                {text("surname", "Surname")}
                {text("email", "Email")}
                {text("phone", "Phone")}
                {text("age", "Age", "number")}
                {select("course", "All courses", COURSES)}
                {select("course_format", "All formats", COURSE_FORMATS)}
                {select("course_type", "All types", COURSE_TYPES)}
                {select("status", "All statuses", ORDER_STATUSES)}
                {select(
                    "group",
                    "All groups",
                    groups.map((group) => group.name)
                )}
                <input
                    type="date"
                    className={fieldClass}
                    aria-label="Start date"
                    title="Start date"
                    value={filters.start_date}
                    max={filters.end_date || undefined}
                    onChange={(e) => onChange("start_date", e.target.value)}
                />
                <input
                    type="date"
                    className={fieldClass}
                    aria-label="End date"
                    title="End date"
                    value={filters.end_date}
                    min={filters.start_date || undefined}
                    onChange={(e) => onChange("end_date", e.target.value)}
                />
            </div>

            <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                <label className="flex cursor-pointer items-center gap-2 text-sm whitespace-nowrap select-none">
                    <input
                        type="checkbox"
                        className="h-4 w-4 accent-green-600"
                        checked={filters.my === "true"}
                        onChange={(e) => onChange("my", e.target.checked ? "true" : "")}
                    />
                    My
                </label>
                <Button variant="secondary" onClick={onReset} disabled={!hasFilters} title="Reset filters">
                    Reset
                </Button>
                <Button variant="secondary" onClick={onRefresh} title="Reload orders">
                    Refresh
                </Button>
                <Button onClick={onExport} disabled={exporting} title="Download the filtered orders as .xlsx">
                    {exporting ? "Exporting..." : "Excel"}
                </Button>
            </div>
        </div>
    );
}
