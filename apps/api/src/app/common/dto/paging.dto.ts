import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

import { SortDirection } from '../common.constants';

const pagingMetaSchema = z
    .object({
        count: z.number(),
        totalCount: z.number(),
        skip: z.number(),
    })
    .openapi({ title: 'PagingMeta' });

export class PagingMeta extends createZodDto(pagingMetaSchema) {}

const pagingQuerySchema = z
    .object({
        take: z.coerce.number().optional(),
        skip: z.coerce.number().optional(),
        search: z.string().optional(),
        sortDirection: z.nativeEnum(SortDirection).optional(),
    })
    .openapi({ title: 'PagingQuery' });

export class PagingQuery extends createZodDto(pagingQuerySchema) {}
