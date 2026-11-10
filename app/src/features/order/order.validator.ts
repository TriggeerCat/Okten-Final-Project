import z from "zod";

import { SORTABLE_FIELDS } from "./enums/order.enum";

const orderParam = z.enum([...SORTABLE_FIELDS, ...SORTABLE_FIELDS.map((field) => `-${field}` as const)]);

// TODO: filters from section 8 (name, surname, email, phone, age, course, ..., start/end date, my)
export const orderListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    order: orderParam.optional().default("-id")
});

export type IOrderListQuery = z.infer<typeof orderListQuerySchema>;
