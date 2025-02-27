import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;

const changePasswordRequestSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string().min(8).max(255).regex(passwordRegex),
});

// Only allow alphanumeric characters, dashes, and spaces
export class ChangePasswordRequest extends createZodDto(
    changePasswordRequestSchema,
) {}
