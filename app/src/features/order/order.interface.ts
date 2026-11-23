import { Types } from "mongoose";

import { Course, CourseFormat, CourseType, OrderStatus } from "./enums/order.enum";

// field names follow the OktenSchool dump (orders.dump / orders.sql)
export interface IOrder {
    _id: string;
    id?: number;
    name: string | null;
    surname: string | null;
    email: string | null;
    phone: string | null;
    age: number | null;
    course: Course | null;
    course_format: CourseFormat | null;
    course_type: CourseType | null;
    status: OrderStatus | null;
    sum: number | null;
    alreadyPaid: number | null;
    created_at: Date;
    utm: string | null;
    msg: string | null;
    manager: Types.ObjectId | null;
    group: Types.ObjectId | null;
}

// what GET /orders returns: manager and group are populated
export interface IOrderListItem extends Omit<IOrder, "manager" | "group"> {
    manager: { _id: Types.ObjectId; name: string; surname: string } | null;
    group: { _id: Types.ObjectId; name: string } | null;
}
