import { type EntityManager } from '@mikro-orm/core';
import { mock, mockReset } from 'jest-mock-extended';

import { type Logger } from '@libs/logger';
import { type UserRepository } from '@libs/models';
import { createTestUser } from '@libs/testing';

import { InvalidOldPassword } from '../auth.errors';
import { type ChangePasswordRequest } from '../dto';
import { type HashService } from '../services';

import { ChangePasswordHandler } from './change-password.command';

describe('ChangePasswordHandler', () => {
    const userRepository = mock<UserRepository>();
    const hashService = mock<HashService>();
    const entityManager = mock<EntityManager>();

    const handler = new ChangePasswordHandler(
        userRepository,
        hashService,
        mock<Logger>(),
    );

    beforeEach(() => {
        userRepository.getEntityManager.mockReturnValue(entityManager);
    });

    afterEach(() => {
        mockReset(userRepository);
        mockReset(hashService);
        mockReset(entityManager);
    });

    describe('execute', () => {
        it('should successfully change password', async () => {
            const request: ChangePasswordRequest = {
                oldPassword: 'my_old_password',
                newPassword: 'my_new_password',
            };
            const user = createTestUser();

            userRepository.findOneOrFail.mockResolvedValue(user);
            hashService.compare.mockResolvedValue(true);
            hashService.hash.mockResolvedValue('hashed');

            await handler.execute({
                data: request,
                session: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    state: user.state,
                    userId: user.id,
                },
            });

            expect(user.password).toBe('hashed');
            expect(entityManager.flush).toHaveBeenCalled();
        });

        it('should fail when the old password is wrong', async () => {
            const request: ChangePasswordRequest = {
                oldPassword: 'my_invalid_old_password',
                newPassword: 'my_new_password',
            };
            const user = createTestUser({ password: 'my_old_password' });

            userRepository.findOneOrFail.mockResolvedValue(user);

            await expect(
                handler.execute({
                    data: request,
                    session: {
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        state: user.state,
                        userId: user.id,
                    },
                }),
            ).rejects.toThrow(InvalidOldPassword);
        });
    });
});
