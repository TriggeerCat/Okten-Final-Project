import { Role } from "./enums/role.enum";

export interface IUser {
    _id: string;
    email: string;
    name: string;
    surname: string;
    password?: string;
    role: Role;
    is_active: boolean;
    is_banned: boolean;
    last_login: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type IUserCreateDTO = Pick<IUser, "email" | "name" | "surname"> &
    Partial<Pick<IUser, "password" | "role" | "is_active">>;
