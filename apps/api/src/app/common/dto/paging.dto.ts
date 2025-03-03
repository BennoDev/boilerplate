import { z } from 'zod';

import { createZodDtoPatch } from '../../../patch-zod-openapi';
import { SortDirection } from '../common.constants';

const pagingMetaSchema = z
    .object({
        count: z.number(),
        totalCount: z.number(),
        skip: z.number(),
    })
    .openapi({ title: 'PagingMeta' });

export const PagingMeta = createZodDtoPatch(pagingMetaSchema);
export type PagingMeta = z.infer<typeof pagingMetaSchema>;

const pagingQuerySchema = z
    .object({
        take: z.coerce.number().optional(),
        skip: z.coerce.number().optional(),
        search: z.string().optional(),
        sortDirection: z.nativeEnum(SortDirection).optional(),
    })
    .openapi({ title: 'PagingQuery' });

export const PagingQuery = createZodDtoPatch(pagingQuerySchema);
export type PagingQuery = z.infer<typeof pagingQuerySchema>;
