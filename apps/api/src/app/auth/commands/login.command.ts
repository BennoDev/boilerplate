import { Injectable, UnauthorizedException } from '@nestjs/common';

import { type IHandler } from '@libs/core';
import { Logger } from '@libs/logger';
import { UserRepository, type User, UserState } from '@libs/models';

import { InvalidUserState } from '../auth.errors';
import { type LoginRequest } from '../dto';
import { HashService } from '../services';

export type LoginCommand = {
    data: LoginRequest;
};

@Injectable()
export class LoginHandler implements IHandler<LoginCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly hashService: HashService,
        private readonly logger: Logger,
    ) {
        this.logger.setContext('LoginHandler');
    }

    async execute({ data }: LoginCommand): Promise<User> {
        const arg = data.type === 'email' ? data.email : data.username;

        const user = await this.userRepository.findOneOrFail(
            { [data.type]: arg },
            { failHandler: () => new UnauthorizedException() },
        );

        if (![UserState.Active].includes(user.state)) {
            this.logger.warn('This action is not allowed for this user', {
                state: user.state,
                allowedStates: [UserState.Active],
            });
            throw new InvalidUserState();
        }

        const isValidPassword = await this.hashService.compare(
            data.password,
            user.password,
        );
        if (!isValidPassword) {
            this.logger.warn('Invalid password for login attempt', {
                emailOrUsername: arg,
            });
            throw new UnauthorizedException();
        }

        return user;
    }
}
