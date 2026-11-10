import { SortOrder } from "mongoose";

import { OrderModel } from "./order.model";
import { IOrderListQuery } from "./order.validator";
import { PAGE_SIZE, paginate } from "../api/pagination";

class OrderService {
    public async getList({ page, order }: IOrderListQuery) {
        const field = order.replace(/^-/, "");
        const direction: SortOrder = order.startsWith("-") ? -1 : 1;
        // _id as a tie breaker keeps pages stable when the sorted field has duplicates
        const sort: Record<string, SortOrder> = { [field]: direction, _id: direction };

        const [data, total] = await Promise.all([
            OrderModel.find()
                .sort(sort)
                .skip((page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE)
                .lean(),
            OrderModel.countDocuments()
        ]);

        return paginate(data, total, page);
    }
}

export const orderService = new OrderService();
