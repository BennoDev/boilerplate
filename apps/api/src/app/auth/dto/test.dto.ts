import { z } from 'zod';

import { createZodDtoPatch } from '../../../patch-zod-openapi';

const testResponseSchema = z
    .discriminatedUnion('type', [
        z.object({
            type: z.literal('foo'),
            foo: z.string(),
        }),
        z.object({
            type: z.literal('bar'),
            bar: z.string(),
        }),
    ])
    .openapi({ title: 'TestResponse' });

export const TestResponse = createZodDtoPatch(testResponseSchema);
export type TestResponse = z.infer<typeof testResponseSchema>;
