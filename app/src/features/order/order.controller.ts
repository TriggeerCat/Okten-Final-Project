import { Request, Response } from "express";

import { orderService } from "./order.service";
import { ILocalsTokenQuery } from "../api/req-res-types.interface";
import { IOrderListQuery } from "./order.validator";

class OrderController {
    public async getList(req: Request, res: Response<any, ILocalsTokenQuery<IOrderListQuery>>) {
        res.json(await orderService.getList(res.locals.validQuery));
    }
}

export const orderController = new OrderController();
