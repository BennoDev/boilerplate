import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

/**
 * Gets the user session for the current request.
 */
export const GetUserSession = createParamDecorator(
    (_, context: ExecutionContext) => context.switchToHttp().getRequest().user,
);
