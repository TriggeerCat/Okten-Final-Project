import { Router } from "express";

import { authRouter } from "../auth/auth.router";
import { orderRouter } from "../order/order.router";

const router = Router();

router.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

router.use("/auth", authRouter);
router.use("/orders", orderRouter);

export const apiRouter = router;
