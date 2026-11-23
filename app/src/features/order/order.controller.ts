import { Request, Response } from "express";

import { orderService } from "./order.service";
import { ILocalsTokenQuery } from "../api/req-res-types.interface";
import { IOrderListQuery } from "./order.validator";

class OrderController {
    public async getList(req: Request, res: Response<any, ILocalsTokenQuery<IOrderListQuery>>) {
        const { validQuery, tokenPayload } = res.locals;
        res.json(await orderService.getList(validQuery, tokenPayload.userId));
    }
}

export const orderController = new OrderController();
