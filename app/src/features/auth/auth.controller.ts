import { Request, Response } from "express";

import { authService } from "./auth.service";
import { STATUS_CODES } from "../../enums/status-codes.enum";
import { ITokenPayload } from "../token/token.interface";

class AuthController {
    public async signIn(req: Request, res: Response) {
        res.json(await authService.signIn(req.body));
    }

    public async refresh(req: Request, res: Response) {
        const { refreshToken, tokenPayload } = res.locals as { refreshToken: string; tokenPayload: ITokenPayload };
        res.json(await authService.refresh(refreshToken, tokenPayload));
    }

    public async signOut(req: Request, res: Response) {
        await authService.signOut(res.locals.accessToken);
        res.sendStatus(STATUS_CODES.no_content);
    }

    public async me(req: Request, res: Response) {
        res.json(await authService.me(res.locals.tokenPayload.userId));
    }
}

export const authController = new AuthController();
