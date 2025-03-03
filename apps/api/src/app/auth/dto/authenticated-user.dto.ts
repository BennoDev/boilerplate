import { z } from 'zod';

import { UserState } from '@libs/models';

import { createZodDtoPatch } from '../../../patch-zod-openapi';
import { BaseEntityResponse } from '../../common';

const authenticatedUserResponseSchema = z
    .intersection(
        BaseEntityResponse.zodSchema,
        z.object({
            email: z.string(),
            state: z.nativeEnum(UserState),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
        }),
    )
    .openapi({ title: 'AuthenticatedUserResponse' });

export const AuthenticatedUserResponse = createZodDtoPatch(
    authenticatedUserResponseSchema,
);
export type AuthenticatedUserResponse = z.infer<
    typeof authenticatedUserResponseSchema
>;
