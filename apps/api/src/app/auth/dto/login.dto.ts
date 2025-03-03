import { z } from 'zod';

import { createZodDtoPatch } from '../../../patch-zod-openapi';

const loginRequestSchema = z
    .discriminatedUnion('type', [
        z.object({
            type: z.literal('email'),
            email: z.string().email(),
            password: z.string(),
        }),
        z.object({
            type: z.literal('username'),
            username: z.string(),
            password: z.string(),
        }),
    ])
    .openapi({ title: 'LoginRequest' });

export const LoginRequest = createZodDtoPatch(loginRequestSchema);
export type LoginRequest = z.infer<typeof loginRequestSchema>;
