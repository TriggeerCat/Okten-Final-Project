import { Router } from "express";

import { groupController } from "./group.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { commonMiddleware } from "../api/common.middleware";
import { createGroupSchema } from "./group.validator";

const router = Router();

// any signed-in user may add a group (ADD GROUP in the edit form, section 7)
router.get("/", authMiddleware.checkAccessToken, groupController.getAll);
router.post(
    "/",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(createGroupSchema, "body"),
    groupController.create
);

export const groupRouter = router;
