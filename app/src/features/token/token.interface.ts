import { Role } from "../user/enums/role.enum";

export interface ITokenPayload {
    userId: string;
    role: Role;
}

export interface ITokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface ITokens extends ITokenPair {
    userId: string;
}
