import { UUID } from 'node:crypto';

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Queue } from 'bullmq';

import { type IHandler } from '@libs/core';
import { Logger } from '@libs/logger';
import { UserRepository, type User, UserState } from '@libs/models';

import { InvalidUserState } from '../auth.errors';
import { type LoginRequest } from '../dto';
import { HashService, MetricsService } from '../services';

export type LoginCommand = {
    data: LoginRequest;
};

@Injectable()
export class LoginHandler implements IHandler<LoginCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly hashService: HashService,
        private readonly logger: Logger,
        @InjectQueue('worker')
        private readonly queue: Queue<{ userId: UUID }>,
        private readonly metricsService: MetricsService,
    ) {
        this.logger.setContext('LoginHandler');
    }

    async execute({ data }: LoginCommand): Promise<User> {
        const { email, password } = data;

        const user = await this.userRepository.findOneOrFail(
            { email },
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
            password,
            user.password,
        );
        if (!isValidPassword) {
            this.logger.warn('Invalid password for login attempt', { email });
            throw new UnauthorizedException();
        }

        this.logger.info('User logged in', {
            jobs: await this.queue.getJobCounts(),
        });
        this.metricsService.incrementLoginCounter();
        await this.queue.add('UserLoggedIn', { userId: user.id });

        return user;
    }
}
