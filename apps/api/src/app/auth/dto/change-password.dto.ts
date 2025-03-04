import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

// Only allow alphanumeric characters, dashes, and spaces
const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;

const changePasswordRequestSchema = z
    .object({
        oldPassword: z.string(),
        newPassword: z
            .string()
            .min(8)
            .max(255)
            .regex(passwordRegex)
            .openapi({ example: 'A_VerySolid_P4ssword!' }),
    })
    .openapi({ title: 'ChangePasswordRequest' });

export class ChangePasswordRequest extends createZodDto(
    changePasswordRequestSchema,
) {}
