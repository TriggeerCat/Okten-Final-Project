import { ApiError } from "../api/api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { userService } from "../user/user.service";
import { tokenService } from "../token/token.service";
import { ITokenPayload } from "../token/token.interface";
import { ISignIn } from "./auth.validator";

class AuthService {
    public async signIn({ email, password }: ISignIn) {
        const user = await userService.getByEmailWithPassword(email);
        if (!user?.password || !(await userService.comparePassword(password, user.password))) {
            throw new ApiError("Invalid email or password", STATUS_CODES.unauthorized);
        }
        if (!user.is_active) throw new ApiError("User is not activated", STATUS_CODES.forbidden);
        if (user.is_banned) throw new ApiError("User is banned", STATUS_CODES.forbidden);

        const userId = String(user._id);
        const tokens = await tokenService.createForUser({ userId, role: user.role });
        await userService.updateLastLogin(userId);

        delete user.password;
        return { user, tokens };
    }

    // refresh tokens are single use: the old pair is removed and a new one is issued
    public async refresh(refreshToken: string, { userId, role }: ITokenPayload) {
        await tokenService.deleteByRefreshToken(refreshToken);
        return await tokenService.createForUser({ userId, role });
    }

    public async signOut(accessToken: string) {
        await tokenService.deleteByAccessToken(accessToken);
    }

    public async me(userId: string) {
        const user = await userService.getById(userId);
        if (!user) throw new ApiError("User not found", STATUS_CODES.not_found);
        return user;
    }
}

export const authService = new AuthService();
