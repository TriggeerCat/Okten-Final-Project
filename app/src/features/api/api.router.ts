import { Router } from "express";

import { authRouter } from "../auth/auth.router";
import { groupRouter } from "../group/group.router";
import { orderRouter } from "../order/order.router";

const router = Router();

router.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

router.use("/auth", authRouter);
router.use("/groups", groupRouter);
router.use("/orders", orderRouter);

export const apiRouter = router;
