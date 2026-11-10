import { NextFunction, Request, Response } from "express";

import { ApiError } from "../api/api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { tokenService } from "../token/token.service";
import { UserModel } from "../user/user.model";
import { ILocalsToken } from "../api/req-res-types.interface";
import { Role } from "../user/enums/role.enum";

class AuthMiddleware {
    public async checkAccessToken(req: Request, res: Response, next: NextFunction) {
        const [scheme, accessToken] = req.headers.authorization?.split(" ") ?? [];
        if (scheme !== "Bearer" || !accessToken) {
            next(new ApiError("No bearer token provided", STATUS_CODES.unauthorized));
            return;
        }
        const { userId } = tokenService.verifyToken(accessToken, "access");
        if (!(await tokenService.doesTokenExist(accessToken, "access"))) {
            next(new ApiError("Invalid token provided", STATUS_CODES.unauthorized));
            return;
        }
        // role and ban state are read from the DB, so a ban applies right away
        const user = await UserModel.findById(userId, { role: 1, is_banned: 1 }).lean();
        if (!user) {
            next(new ApiError("User no longer exists", STATUS_CODES.unauthorized));
            return;
        }
        if (user.is_banned) {
            next(new ApiError("User is banned", STATUS_CODES.forbidden));
            return;
        }
        res.locals.tokenPayload = { userId, role: user.role };
        res.locals.accessToken = accessToken;
        next();
    }

    public async checkRefreshToken(req: Request, res: Response, next: NextFunction) {
        const { refreshToken } = (req.body ?? {}) as { refreshToken?: unknown };
        if (!refreshToken || typeof refreshToken !== "string") {
            next(new ApiError("No token provided", STATUS_CODES.unauthorized));
            return;
        }
        const tokenPayload = tokenService.verifyToken(refreshToken, "refresh");
        if (!(await tokenService.doesTokenExist(refreshToken, "refresh"))) {
            next(new ApiError("Invalid token provided", STATUS_CODES.unauthorized));
            return;
        }
        res.locals.tokenPayload = tokenPayload;
        res.locals.refreshToken = refreshToken;
        next();
    }

    // must be placed after checkAccessToken
    public requireRole(...roles: Role[]) {
        return (req: Request, res: Response<any, ILocalsToken>, next: NextFunction) => {
            if (!roles.includes(res.locals.tokenPayload.role)) {
                next(new ApiError("Forbidden", STATUS_CODES.forbidden));
                return;
            }
            next();
        };
    }
}

export const authMiddleware = new AuthMiddleware();
