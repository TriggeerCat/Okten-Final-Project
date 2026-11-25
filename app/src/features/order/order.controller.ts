import { Request, Response } from "express";

import { orderService } from "./order.service";
import { writeOrdersXlsx } from "./order.excel";
import { ILocalsTokenQuery } from "../api/req-res-types.interface";
import { IOrderExportQuery, IOrderListQuery } from "./order.validator";

class OrderController {
    public async getList(req: Request, res: Response<any, ILocalsTokenQuery<IOrderListQuery>>) {
        const { validQuery, tokenPayload } = res.locals;
        res.json(await orderService.getList(validQuery, tokenPayload.userId));
    }

    public async exportExcel(req: Request, res: Response<any, ILocalsTokenQuery<IOrderExportQuery>>) {
        const { validQuery, tokenPayload } = res.locals;
        // the filter is built before any byte is sent, so a bad query still gets a JSON error
        const cursor = await orderService.getExportCursor(validQuery, tokenPayload.userId);

        const fileName = `orders_${new Date().toISOString().slice(0, 10)}.xlsx`;
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

        try {
            await writeOrdersXlsx(cursor, res);
        } finally {
            await cursor.close();
        }
    }
}

export const orderController = new OrderController();
