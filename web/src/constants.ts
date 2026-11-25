// allowed values from the spec (section 7), same as app/src/features/order/enums/order.enum.ts
export const ORDER_STATUSES = ["In work", "New", "Agree", "Disagree", "Dubbing"] as const;
export const COURSES = ["FS", "QACX", "JCX", "JSCX", "FE", "PCX"] as const;
export const COURSE_TYPES = ["pro", "minimal", "premium", "incubator", "vip"] as const;
export const COURSE_FORMATS = ["static", "online"] as const;

// section 8 filters, in panel order; each one is a query param of GET /orders and of the page URL
export const FILTER_KEYS = [
    "name",
    "surname",
    "email",
    "phone",
    "age",
    "course",
    "course_format",
    "course_type",
    "status",
    "group",
    "start_date",
    "end_date",
    "my"
] as const;

export type FilterKey = (typeof FILTER_KEYS)[number];
export type Filters = Record<FilterKey, string>;
