import { model, Schema } from "mongoose";

import { IGroup } from "./group.interface";

// orders reference groups by id; list / create endpoints come on day 4
const GroupSchema = new Schema(
    {
        name: { type: String, required: true, trim: true }
    },
    { timestamps: true, versionKey: false }
);

// "FE-2024" and "fe-2024" are the same group
GroupSchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export const GroupModel = model<IGroup>("groups", GroupSchema);
