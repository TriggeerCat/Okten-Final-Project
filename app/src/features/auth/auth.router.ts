import { Router } from "express";

import { authController } from "./auth.controller";
import { authMiddleware } from "./auth.middleware";
import { commonMiddleware } from "../api/common.middleware";
import { signInSchema } from "./auth.validator";

const router = Router();

router.post("/sign-in", commonMiddleware.validate(signInSchema, "body"), authController.signIn);
router.post("/refresh", authMiddleware.checkRefreshToken, authController.refresh);
router.post("/sign-out", authMiddleware.checkAccessToken, authController.signOut);
router.get("/me", authMiddleware.checkAccessToken, authController.me);

// TODO: POST /activate/:token and POST /recovery/:token (set password by action token)

export const authRouter = router;
