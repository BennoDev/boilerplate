import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { SortDirection } from '../common.constants';

export class PagingMeta {
    readonly count!: number;
    readonly totalCount!: number;
    readonly skip!: number;
}

const pagingQuerySchema = z.object({
    take: z.coerce.number().optional(),
    skip: z.coerce.number().optional(),
    search: z.string().optional(),
    sortDirection: z.nativeEnum(SortDirection).optional(),
});

export class PagingQuery extends createZodDto(pagingQuerySchema) {}
