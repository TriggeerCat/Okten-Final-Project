import { model, Schema } from "mongoose";

import { IGroup } from "./group.interface";

// orders reference groups by id; GET /groups lists them, POST /groups adds one
const GroupSchema = new Schema(
    {
        name: { type: String, required: true, trim: true }
    },
    { timestamps: true, versionKey: false }
);

// "FE-2024" and "fe-2024" are the same group
GroupSchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export const GroupModel = model<IGroup>("groups", GroupSchema);
