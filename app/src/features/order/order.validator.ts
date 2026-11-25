import z from "zod";

import { COURSE_FORMATS, COURSE_TYPES, COURSES, ORDER_STATUSES, SORTABLE_FIELDS } from "./enums/order.enum";

const orderParam = z.enum([...SORTABLE_FIELDS, ...SORTABLE_FIELDS.map((field) => `-${field}` as const)]);

// the filter panel sends empty params (?name=) when a field is cleared; treat them as "no filter"
const optional = <T extends z.ZodType>(schema: T) =>
    z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? undefined : value), schema.optional());

const text = optional(z.string().trim().max(100));

// section 8 filters; all of them are optional and combined with AND
const filterFields = {
    order: orderParam.optional().default("-id"),

    // substring match, case-insensitive
    name: text,
    surname: text,
    email: text,
    phone: text,

    age: optional(z.coerce.number().int().min(0).max(150)),
    course: optional(z.enum(COURSES)),
    course_format: optional(z.enum(COURSE_FORMATS)),
    course_type: optional(z.enum(COURSE_TYPES)),
    status: optional(z.enum(ORDER_STATUSES)),
    // group name, exact match, case-insensitive
    group: text,

    // YYYY-MM-DD, both ends inclusive
    start_date: optional(z.iso.date()),
    end_date: optional(z.iso.date()),

    // only orders of the current user
    my: optional(z.stringbool())
};

const validDateRange = ({ start_date, end_date }: { start_date?: string; end_date?: string }) =>
    !start_date || !end_date || start_date <= end_date;
const dateRangeError = { message: "start_date must not be after end_date", path: ["end_date"] };

// GET /orders
export const orderListQuerySchema = z
    .object({ page: z.coerce.number().int().min(1).optional().default(1), ...filterFields })
    .refine(validDateRange, dateRangeError);

// GET /orders/excel: same filters and sorting, no paging
export const orderExportQuerySchema = z.object(filterFields).refine(validDateRange, dateRangeError);

export type IOrderListQuery = z.infer<typeof orderListQuerySchema>;
export type IOrderExportQuery = z.infer<typeof orderExportQuerySchema>;
export type IOrderFilterQuery = Omit<IOrderExportQuery, "order">;
