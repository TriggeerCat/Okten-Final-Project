export const ROLES = {
    admin: "admin",
    manager: "manager"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
