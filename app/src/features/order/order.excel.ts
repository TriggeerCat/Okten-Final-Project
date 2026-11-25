import { Writable } from "node:stream";

import ExcelJS from "exceljs";

import { IOrderListItem } from "./order.interface";

// same columns as the orders table, plus the message and UTM from the expanded row
const COLUMNS: { header: string; width: number; value: (order: IOrderListItem) => unknown }[] = [
    { header: "id", width: 8, value: (o) => o.id },
    { header: "name", width: 16, value: (o) => o.name },
    { header: "surname", width: 16, value: (o) => o.surname },
    { header: "email", width: 28, value: (o) => o.email },
    { header: "phone", width: 16, value: (o) => o.phone },
    { header: "age", width: 6, value: (o) => o.age },
    { header: "course", width: 9, value: (o) => o.course },
    { header: "course_format", width: 14, value: (o) => o.course_format },
    { header: "course_type", width: 12, value: (o) => o.course_type },
    { header: "status", width: 10, value: (o) => o.status },
    { header: "sum", width: 10, value: (o) => o.sum },
    { header: "alreadyPaid", width: 12, value: (o) => o.alreadyPaid },
    { header: "created_at", width: 12, value: (o) => o.created_at },
    { header: "manager", width: 20, value: (o) => (o.manager ? `${o.manager.name} ${o.manager.surname}` : null) },
    { header: "group", width: 14, value: (o) => o.group?.name },
    { header: "utm", width: 24, value: (o) => o.utm },
    { header: "msg", width: 40, value: (o) => o.msg }
];

export const writeOrdersXlsx = async (orders: AsyncIterable<IOrderListItem>, stream: Writable) => {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream, useStyles: true });
    const sheet = workbook.addWorksheet("Orders", { views: [{ state: "frozen", ySplit: 1 }] });
    sheet.columns = COLUMNS.map(({ header, width }) => ({ header, key: header, width }));
    sheet.getColumn("created_at").numFmt = "dd.mm.yyyy";

    const header = sheet.getRow(1);
    header.font = { bold: true };
    header.commit();

    // empty cells instead of "null", so the sheet can be filtered and summed in Excel
    for await (const order of orders) {
        sheet.addRow(COLUMNS.map(({ value }) => value(order) ?? null)).commit();
    }

    sheet.commit();
    await workbook.commit();
};
