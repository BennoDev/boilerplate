import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const loginRequestSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export class LoginRequest extends createZodDto(loginRequestSchema) {}
