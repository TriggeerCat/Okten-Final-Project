import { GroupModel } from "./group.model";
import { ICreateGroupDTO } from "./group.validator";
import { ApiError } from "../api/api.error";
import { STATUS_CODES } from "../../enums/status-codes.enum";

// same collation as the unique index, so "FE-2024" and "fe-2024" are one group
const CASE_INSENSITIVE = { locale: "en", strength: 2 } as const;

class GroupService {
    public getAll() {
        return GroupModel.find({}, { name: 1 }).collation(CASE_INSENSITIVE).sort({ name: 1 }).lean();
    }

    public async create({ name }: ICreateGroupDTO) {
        // the unique index also catches a race between two requests (11000 -> 409 in main.ts)
        if (await GroupModel.exists({ name }).collation(CASE_INSENSITIVE)) {
            throw new ApiError(`Group "${name}" already exists`, STATUS_CODES.conflict);
        }
        const { _id } = await GroupModel.create({ name });
        return { _id, name };
    }
}

export const groupService = new GroupService();
