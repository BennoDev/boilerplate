import { z } from 'zod';

import { createZodDtoPatch } from '../../../patch-zod-openapi';

const baseEntityResponseSchema = z
    .object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
    })
    .openapi({ title: 'BaseEntityResponse' });

export const BaseEntityResponse = createZodDtoPatch(baseEntityResponseSchema);
export type BaseEntityResponse = z.infer<typeof baseEntityResponseSchema>;
