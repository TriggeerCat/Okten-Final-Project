import { ITokenPayload } from "../token/token.interface";

export interface ILocalsToken {
    tokenPayload: ITokenPayload;
}

export interface ILocalsQuery<T> {
    validQuery: T;
}

export type ILocalsTokenQuery<T> = ILocalsToken & ILocalsQuery<T>;
