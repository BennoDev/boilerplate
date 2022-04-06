import { Injectable, UnauthorizedException } from '@nestjs/common';

import { IHandler } from '@libs/common';
import { Logger } from '@libs/logger';
import { UserRepository, User, UserState } from '@libs/models';

import { UserStateNotAllowed } from '../auth.errors';
import { LoginRequest } from '../dto';
import { HashService } from '../services';

const context = 'LoginHandler';

export type LoginCommand = {
    data: LoginRequest;
};

@Injectable()
export class LoginHandler implements IHandler<LoginCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly hashService: HashService,
        private readonly logger: Logger,
    ) {}

    async execute({ data }: LoginCommand): Promise<User> {
        const { email, password } = data;

        const user = await this.userRepository.findOneOrFail(
            { email },
            { failHandler: () => new UnauthorizedException() },
        );

        if (![UserState.Active].includes(user.state)) {
            this.logger.warn('This action is not allowed for this user', {
                context,
                state: user.state,
                allowedStates: [UserState.Active],
            });
            throw new UserStateNotAllowed();
        }

        const isValidPassword = await this.hashService.compare(
            password,
            user.password,
        );
        if (!isValidPassword) {
            this.logger.warn('Invalid password for login attempt', {
                context,
                email,
            });
            throw new UnauthorizedException();
        }

        return user;
    }
}
