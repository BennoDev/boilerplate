import { Injectable } from '@nestjs/common';

import { IHandler } from '@libs/common';
import { Logger } from '@libs/logger';
import { UserRepository } from '@libs/models';

import { UserSession } from '../../common/common.types';
import { InvalidOldPassword } from '../auth.errors';
import { ChangePasswordRequest } from '../dto';
import { HashService } from '../services';

const context = 'ChangePasswordHandler';

export type ChangePasswordCommand = {
    data: ChangePasswordRequest;
    session: UserSession;
};

@Injectable()
export class ChangePasswordHandler implements IHandler<ChangePasswordCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly hashService: HashService,
        private readonly logger: Logger,
    ) {}

    async execute({ data, session }: ChangePasswordCommand): Promise<void> {
        const user = await this.userRepository.findOneOrFail(session.userId);

        const isCorrectOldPassword = await this.hashService.compare(
            data.oldPassword,
            user.password,
        );

        if (!isCorrectOldPassword) {
            this.logger.warn(
                'Invalid old password for change password attempt',
                { context, userId: session.userId },
            );
            throw new InvalidOldPassword();
        }

        user.password = await this.hashService.hash(data.newPassword);
        await this.userRepository.flush();
    }
}
