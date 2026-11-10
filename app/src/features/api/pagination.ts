export const PAGE_SIZE = 25;

export interface IPaginated<T> {
    data: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export const paginate = <T>(data: T[], total: number, page: number, pageSize = PAGE_SIZE): IPaginated<T> => ({
    data,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
});
