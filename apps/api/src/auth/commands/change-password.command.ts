import { Injectable } from '@nestjs/common';

import { type IHandler } from '@libs/common';
import { Logger } from '@libs/logger';
import { UserRepository } from '@libs/models';

import { type UserSession } from '../../common';
import { InvalidOldPassword } from '../auth.errors';
import { type ChangePasswordRequest } from '../dto';
import { HashService } from '../services';

export type ChangePasswordCommand = {
    data: ChangePasswordRequest;
    session: UserSession;
}

@Injectable()
export class ChangePasswordHandler implements IHandler<ChangePasswordCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly hashService: HashService,
        private readonly logger: Logger,
    ) {
        this.logger.setContext('ChangePasswordHandler');
    }

    async execute({ data, session }: ChangePasswordCommand): Promise<void> {
        const user = await this.userRepository.findOneOrFail(session.userId);

        const isCorrectOldPassword = await this.hashService.compare(
            data.oldPassword,
            user.password,
        );

        if (!isCorrectOldPassword) {
            this.logger.warn(
                'Invalid old password for change password attempt',
                { userId: session.userId },
            );
            throw new InvalidOldPassword();
        }

        user.password = await this.hashService.hash(data.newPassword);
        await this.userRepository.flush();
    }
}
