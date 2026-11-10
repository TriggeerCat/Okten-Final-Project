// allowed values from the spec (section 7)
export const ORDER_STATUSES = ["In work", "New", "Agree", "Disagree", "Dubbing"] as const;
export const COURSES = ["FS", "QACX", "JCX", "JSCX", "FE", "PCX"] as const;
export const COURSE_TYPES = ["pro", "minimal", "premium", "incubator", "vip"] as const;
export const COURSE_FORMATS = ["static", "online"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type Course = (typeof COURSES)[number];
export type CourseType = (typeof COURSE_TYPES)[number];
export type CourseFormat = (typeof COURSE_FORMATS)[number];

// columns the table can be sorted by (?order=field or ?order=-field)
export const SORTABLE_FIELDS = [
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
] as const;
