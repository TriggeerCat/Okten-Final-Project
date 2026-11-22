// Imports the OktenSchool orders dump into the database from MONGO_URI.
//
// The dump (https://github.com/OktenSchool/dumps/blob/main/final/orders.dump) is a mongosh script:
// a single db.orders.insertMany([...]) call, not a mongorestore archive. It also differs from what
// the app expects, so the records are normalized before inserting:
//   - there is no numeric id: ids 1..N are assigned in dump order (the dump is sorted by created_at)
//   - already_paid is renamed to alreadyPaid
//   - empty strings become null (enum fields would otherwise fail validation on edit)
//   - created_at is converted from an ISO string to a Date
//
// Usage: npm run import:orders [-- <path to dump>] [-- --drop]
//   --drop  removes existing orders first; without it the script refuses to import into a non-empty collection
import { readFileSync } from "node:fs";
import path from "node:path";

import mongoose from "mongoose";

import { connectToDB } from "../db/mongoose";
import { OrderModel } from "../features/order/order.model";

type DumpRecord = Record<string, unknown>;

const DEFAULT_DUMP_PATH = path.resolve(__dirname, "../../../dumps/orders.dump");

const parseDump = (content: string): DumpRecord[] => {
    const start = content.indexOf("[");
    const end = content.lastIndexOf("]");
    if (start === -1 || end <= start) throw new Error("No JSON array found in the dump");
    const records: unknown = JSON.parse(content.slice(start, end + 1));
    if (!Array.isArray(records)) throw new Error("Dump does not contain an array of orders");
    return records as DumpRecord[];
};

const emptyToNull = (value: unknown) => (value === "" || value === undefined ? null : value);

const toDate = (value: unknown) => {
    if (typeof value !== "string" || !value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const normalize = (record: DumpRecord, index: number) => {
    const { already_paid, created_at, ...rest } = record;
    const order: DumpRecord = {};
    for (const [key, value] of Object.entries(rest)) order[key] = emptyToNull(value);

    return {
        ...order,
        id: index + 1,
        alreadyPaid: emptyToNull(already_paid ?? order.alreadyPaid),
        created_at: toDate(created_at),
        manager: emptyToNull(order.manager),
        group: emptyToNull(order.group)
    };
};

const main = async () => {
    const args = process.argv.slice(2);
    const drop = args.includes("--drop");
    const dumpPath = path.resolve(args.find((arg) => !arg.startsWith("--")) ?? DEFAULT_DUMP_PATH);

    const orders = parseDump(readFileSync(dumpPath, "utf8")).map(normalize);
    console.log(`Read ${orders.length} orders from ${dumpPath}`);

    await connectToDB();

    const existing = await OrderModel.estimatedDocumentCount();
    if (existing > 0) {
        if (!drop) {
            throw new Error(
                `The orders collection already has ${existing} documents. Re-run with --drop to replace them.`
            );
        }
        await OrderModel.deleteMany({});
        console.log(`Removed ${existing} existing orders`);
    }

    // insertMany validates every record against the schema (enum values etc.)
    await OrderModel.insertMany(orders);
    await OrderModel.syncIndexes();
    console.log(`Imported ${orders.length} orders`);
};

main()
    .catch((e) => {
        console.error(e instanceof Error ? e.message : e);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
