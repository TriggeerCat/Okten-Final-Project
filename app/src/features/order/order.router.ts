import { Router } from "express";

import { orderController } from "./order.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { commonMiddleware } from "../api/common.middleware";
import { orderListQuerySchema } from "./order.validator";

const router = Router();

router.get(
    "/",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(orderListQuerySchema, "query"),
    orderController.getList
);

// TODO: PATCH /:id (edit form), POST /:id/comments, GET /excel

export const orderRouter = router;
