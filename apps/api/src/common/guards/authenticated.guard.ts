import {
    type ExecutionContext,
    Injectable,
    type CanActivate,
    UnauthorizedException,
} from '@nestjs/common';
import { type Response, type Request } from 'express';

import { UserState } from '@libs/models';

import { type ApiRequest, type UserSession } from '../common.types';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<ApiRequest>();
        const response = context.switchToHttp().getResponse<Response>();
        const session: UserSession | undefined = request.user;

        if (session?.state !== UserState.Active) {
            await destroyExpressSession(request, response);
            // We throw an UnauthorizedException because by not doing it, a ForbiddenException is returned to the client
            throw new UnauthorizedException();
        }

        return true;
    }
}

/**
 * This function invalidates everything that is related to a session: clears the cookie & removes entry from redis
 */
export const destroyExpressSession = (
    request: Request,
    response: Response,
): Promise<void> =>
    new Promise((resolve, reject) => {
        try {
            request.session.destroy(() => {
                response.clearCookie('connect.sid');
                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });
