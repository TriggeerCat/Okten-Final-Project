import { PipelineStage, QueryFilter, Types } from "mongoose";

import { OrderModel } from "./order.model";
import { IOrder, IOrderListItem } from "./order.interface";
import { IOrderExportQuery, IOrderFilterQuery, IOrderListQuery } from "./order.validator";
import { PAGE_SIZE, paginate } from "../api/pagination";
import { GroupModel } from "../group/group.model";
import { UserModel } from "../user/user.model";

const TEXT_FILTERS = ["name", "surname", "email", "phone"] as const;
const EXACT_FILTERS = ["age", "course", "course_format", "course_type"] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// manager and group are refs, so they are sorted by what the table shows (surname / group name)
const REF_SORT = {
    manager: { from: () => UserModel.collection.name, field: "surname" },
    group: { from: () => GroupModel.collection.name, field: "name" }
} as const;

const populateRefs: PipelineStage[] = [
    {
        $lookup: {
            from: UserModel.collection.name,
            localField: "manager",
            foreignField: "_id",
            pipeline: [{ $project: { name: 1, surname: 1 } }],
            as: "manager"
        }
    },
    {
        $lookup: {
            from: GroupModel.collection.name,
            localField: "group",
            foreignField: "_id",
            pipeline: [{ $project: { name: 1 } }],
            as: "group"
        }
    },
    {
        $set: {
            manager: { $ifNull: [{ $first: "$manager" }, null] },
            group: { $ifNull: [{ $first: "$group" }, null] }
        }
    }
];

class OrderService {
    // section 8 filters as a Mongo filter. Aggregation does not cast types, so ids and dates are built here.
    // Shared by the list and the Excel export.
    public async buildFilter(query: IOrderFilterQuery, userId: string): Promise<QueryFilter<IOrder>> {
        const filter: Record<string, unknown> = {};

        for (const field of TEXT_FILTERS) {
            const value = query[field];
            if (value) filter[field] = { $regex: escapeRegex(value), $options: "i" };
        }

        for (const field of EXACT_FILTERS) {
            const value = query[field];
            if (value !== undefined) filter[field] = value;
        }

        // New and null mean the same thing (section 6)
        if (query.status) filter.status = query.status === "New" ? { $in: ["New", null] } : query.status;

        if (query.group) {
            const group = await GroupModel.findOne({ name: query.group })
                .collation({ locale: "en", strength: 2 })
                .lean();
            // unknown group: nothing matches, but the request is still valid
            filter.group = group ? new Types.ObjectId(group._id) : { $in: [] };
        }

        if (query.start_date || query.end_date) {
            const range: Record<string, Date> = {};
            if (query.start_date) range.$gte = new Date(query.start_date);
            // end date is inclusive: everything before the start of the next day
            if (query.end_date) range.$lt = new Date(new Date(query.end_date).getTime() + DAY_MS);
            filter.created_at = range;
        }

        if (query.my) filter.manager = new Types.ObjectId(userId);

        return filter as QueryFilter<IOrder>;
    }

    // ?order=field / -field; _id is a tie breaker that keeps pages stable when the field has duplicates
    private buildSortStages(order: string): PipelineStage[] {
        const field = order.replace(/^-/, "");
        const direction = order.startsWith("-") ? -1 : 1;

        const refSort = REF_SORT[field as keyof typeof REF_SORT];
        if (!refSort) return [{ $sort: { [field]: direction, _id: direction } }];

        return [
            {
                $lookup: {
                    from: refSort.from(),
                    localField: field,
                    foreignField: "_id",
                    pipeline: [{ $project: { [refSort.field]: 1 } }],
                    as: "_sort"
                }
            },
            { $set: { _sort: { $first: `$_sort.${refSort.field}` } } },
            { $sort: { _sort: direction, _id: direction } },
            { $unset: "_sort" }
        ];
    }

    public async getList({ page, order, ...filters }: IOrderListQuery, userId: string) {
        const filter = await this.buildFilter(filters, userId);

        const [data, total] = await Promise.all([
            OrderModel.aggregate<IOrderListItem>([
                { $match: filter },
                ...this.buildSortStages(order),
                { $skip: (page - 1) * PAGE_SIZE },
                { $limit: PAGE_SIZE },
                ...populateRefs
            ]),
            OrderModel.countDocuments(filter)
        ]);

        return paginate(data, total, page);
    }

    // every order that matches the filters, in table order, streamed so a big export does not sit in memory
    public async getExportCursor({ order, ...filters }: IOrderExportQuery, userId: string) {
        const filter = await this.buildFilter(filters, userId);
        return OrderModel.aggregate<IOrderListItem>([
            { $match: filter },
            ...this.buildSortStages(order),
            ...populateRefs
        ]).cursor();
    }
}

export const orderService = new OrderService();
