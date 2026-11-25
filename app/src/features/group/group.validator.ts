import z from "zod";

export const createGroupSchema = z.object({
    name: z.string().trim().min(1, "Group name is required").max(50)
});

export type ICreateGroupDTO = z.infer<typeof createGroupSchema>;
