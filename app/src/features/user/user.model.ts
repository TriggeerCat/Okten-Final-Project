import { model, Schema } from "mongoose";

import { IUser } from "./user.interface";
import { ROLES } from "./enums/role.enum";

const UserSchema = new Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        name: { type: String, required: true, trim: true },
        surname: { type: String, required: true, trim: true },
        // managers get a password only after activation
        password: { type: String, select: false },
        role: { type: String, enum: Object.values(ROLES), default: ROLES.manager },
        is_active: { type: Boolean, default: false },
        is_banned: { type: Boolean, default: false },
        last_login: { type: Date, default: null }
    },
    { timestamps: true, versionKey: false }
);

export const UserModel = model<IUser>("users", UserSchema);
