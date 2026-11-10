import bcrypt from "bcrypt";

import { UserModel } from "./user.model";
import { IUserCreateDTO } from "./user.interface";
import { ROLES } from "./enums/role.enum";
import envData from "../../env/env";

class UserService {
    public hashPassword(password: string) {
        return bcrypt.hash(password, 10);
    }

    public comparePassword(password: string, hash: string) {
        return bcrypt.compare(password, hash);
    }

    public getById(id: string) {
        return UserModel.findById(id).lean();
    }

    public getByEmailWithPassword(email: string) {
        return UserModel.findOne({ email: email.toLowerCase() }).select("+password").lean();
    }

    public async create(dto: IUserCreateDTO) {
        const password = dto.password ? await this.hashPassword(dto.password) : undefined;
        return await UserModel.create({ ...dto, password });
    }

    public updateLastLogin(id: string) {
        return UserModel.updateOne({ _id: id }, { last_login: new Date() });
    }

    // the spec requires admin@gmail.com / admin to exist by default
    public async seedSuperAdmin() {
        const exists = await UserModel.exists({ email: envData.ADMIN_EMAIL.toLowerCase() });
        if (exists) return;
        await this.create({
            email: envData.ADMIN_EMAIL,
            password: envData.ADMIN_PASSWORD,
            name: "admin",
            surname: "admin",
            role: ROLES.admin,
            is_active: true
        });
        console.log(`Super admin ${envData.ADMIN_EMAIL} created`);
    }
}

export const userService = new UserService();
