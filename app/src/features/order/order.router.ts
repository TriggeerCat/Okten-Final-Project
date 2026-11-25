import { Router } from "express";

import { orderController } from "./order.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { commonMiddleware } from "../api/common.middleware";
import { orderExportQuerySchema, orderListQuerySchema } from "./order.validator";

const router = Router();

router.get(
    "/",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(orderListQuerySchema, "query"),
    orderController.getList
);

// same filters and sorting as GET /, all matching orders in one .xlsx file
router.get(
    "/excel",
    authMiddleware.checkAccessToken,
    commonMiddleware.validate(orderExportQuerySchema, "query"),
    orderController.exportExcel
);

// TODO: PATCH /:id (edit form), POST /:id/comments

export const orderRouter = router;
