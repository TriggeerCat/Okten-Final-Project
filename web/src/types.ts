export type Role = "admin" | "manager";

export interface User {
    _id: string;
    email: string;
    name: string;
    surname: string;
    role: Role;
    is_active: boolean;
    is_banned: boolean;
    last_login: string | null;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse {
    user: User;
    tokens: Tokens;
}

export interface Paginated<T> {
    data: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface Order {
    _id: string;
    id?: number;
    name: string | null;
    surname: string | null;
    email: string | null;
    phone: string | null;
    age: number | null;
    course: string | null;
    course_format: string | null;
    course_type: string | null;
    status: string | null;
    sum: number | null;
    alreadyPaid: number | null;
    created_at: string;
    utm: string | null;
    msg: string | null;
    manager: { _id: string; name: string; surname: string } | null;
    group: { _id: string; name: string } | null;
}
