import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const loginRequestSchema = z
    .object({
        email: z.string().email(),
        password: z.string(),
    })
    .openapi({ title: 'LoginRequest' });

export class LoginRequest extends createZodDto(loginRequestSchema) {}
