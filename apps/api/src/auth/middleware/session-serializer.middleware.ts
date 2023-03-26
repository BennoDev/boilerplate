import { type NestMiddleware, Injectable } from '@nestjs/common';
import { type Response, type Request } from 'express';

import { UserRepository } from '@libs/models';

import { type UserSession } from '../../common';

@Injectable()
export class SessionSerializer implements NestMiddleware {
    constructor(private readonly userRepository: UserRepository) {}

    async use(
        req: {
            user: UserSession | null;
            session: { userId: string };
        } & Request,
        _res: Response,
        next: () => void,
    ): Promise<void> {
        const userId = req.session.userId;
        if (!userId) {
            return next();
        }

        req.user = await this.composeUserSession(userId);
        next();
    }

    private async composeUserSession(
        userId: string,
    ): Promise<UserSession | null> {
        const user = await this.userRepository.findOne(userId, {
            // This request happens outside of a MikroORM request scope, so we disable the identity map.
            disableIdentityMap: true,
        });
        if (!user) return null;
        return {
            userId: user.id,
            email: user.email,
            state: user.state,
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }
}
