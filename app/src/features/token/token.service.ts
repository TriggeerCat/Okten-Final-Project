import jwt from "jsonwebtoken";

import { ITokenPair, ITokenPayload } from "./token.interface";
import { TokenModel } from "./token.model";
import { AuthTokens, getLifetimeByTokenType, getSecretByTokenType } from "./token.enum";
import { ApiError } from "../api/api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";

class TokenService {
    public sign({ userId, role }: ITokenPayload, type: AuthTokens) {
        return jwt.sign({ userId, role }, getSecretByTokenType(type), { expiresIn: getLifetimeByTokenType(type) });
    }

    public async createForUser(payload: ITokenPayload): Promise<ITokenPair> {
        const tokens = { accessToken: this.sign(payload, "access"), refreshToken: this.sign(payload, "refresh") };
        await TokenModel.create({ ...tokens, userId: payload.userId });
        return tokens;
    }

    public verifyToken(token: string, type: AuthTokens): ITokenPayload {
        try {
            return jwt.verify(token, getSecretByTokenType(type)) as ITokenPayload;
        } catch {
            throw new ApiError("Invalid or expired token", STATUS_CODES.unauthorized);
        }
    }

    public async doesTokenExist(token: string, type: "access" | "refresh") {
        const filter = type === "access" ? { accessToken: token } : { refreshToken: token };
        return !!(await TokenModel.exists(filter));
    }

    public deleteByRefreshToken(refreshToken: string) {
        return TokenModel.deleteOne({ refreshToken });
    }

    public deleteByAccessToken(accessToken: string) {
        return TokenModel.deleteOne({ accessToken });
    }

    public deleteAllByUserId(userId: string) {
        return TokenModel.deleteMany({ userId });
    }
}

export const tokenService = new TokenService();
