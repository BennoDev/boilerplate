import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import { type ApiRequest } from '../common.types';

/**
 * Gets the user session for the current request.
 */
export const GetUserSession = createParamDecorator(
    (_, context: ExecutionContext) =>
        context.switchToHttp().getRequest<ApiRequest>().user,
);
