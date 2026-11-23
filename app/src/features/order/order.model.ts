import { model, Schema } from "mongoose";

import { IOrder } from "./order.interface";
import { COURSE_FORMATS, COURSE_TYPES, COURSES, ORDER_STATUSES } from "./enums/order.enum";

// null is allowed everywhere because the dump has empty fields
const OrderSchema = new Schema(
    {
        // the dump has no ids, they are assigned by the import script (npm run import:orders)
        id: { type: Number, unique: true, sparse: true },
        name: { type: String, default: null },
        surname: { type: String, default: null },
        email: { type: String, default: null },
        phone: { type: String, default: null },
        age: { type: Number, default: null },
        course: { type: String, enum: [...COURSES, null], default: null },
        course_format: { type: String, enum: [...COURSE_FORMATS, null], default: null },
        course_type: { type: String, enum: [...COURSE_TYPES, null], default: null },
        status: { type: String, enum: [...ORDER_STATUSES, null], default: null },
        sum: { type: Number, default: null },
        alreadyPaid: { type: Number, default: null },
        created_at: { type: Date, default: Date.now },
        utm: { type: String, default: null },
        msg: { type: String, default: null },
        // the dump has no manager / group data, so both are refs from the start
        manager: { type: Schema.Types.ObjectId, ref: "users", default: null },
        group: { type: Schema.Types.ObjectId, ref: "groups", default: null }
    },
    // the collection comes from the dump, keep unknown fields instead of dropping them
    { versionKey: false, strict: false, collection: "orders" }
);

// default sort, "My" filter and the exact-match filters
OrderSchema.index({ created_at: -1 });
OrderSchema.index({ manager: 1, id: -1 });
OrderSchema.index({ group: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ course: 1 });

export const OrderModel = model<IOrder>("orders", OrderSchema);
