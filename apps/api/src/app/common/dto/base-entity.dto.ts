import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const baseEntityResponseSchema = z
    .object({
        id: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
    })
    .openapi({ title: 'BaseEntityResponse' });

export class BaseEntityResponse extends createZodDto(
    baseEntityResponseSchema,
) {}
