import { Request, Response } from "express";

import { groupService } from "./group.service";
import { STATUS_CODES } from "../../enums/status-codes.enum";

class GroupController {
    public async getAll(req: Request, res: Response) {
        res.json(await groupService.getAll());
    }

    public async create(req: Request, res: Response) {
        res.status(STATUS_CODES.created).json(await groupService.create(req.body));
    }
}

export const groupController = new GroupController();
