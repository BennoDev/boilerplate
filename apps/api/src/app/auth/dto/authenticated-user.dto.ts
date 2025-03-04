import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

import { UserState } from '@libs/models';

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

export class AuthenticatedUserResponse extends createZodDto(
    authenticatedUserResponseSchema,
) {}
