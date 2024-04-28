import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { mock, mockReset } from 'jest-mock-extended';

import { type Logger } from '@libs/logger';
import { type UserRepository, UserState } from '@libs/models';
import { createTestUser } from '@libs/testing';

import { InvalidUserState } from '../auth.errors';
import { type HashService } from '../services';

import { LoginHandler } from './login.command';

describe('LoginHandler', () => {
    const userRepository = mock<UserRepository>();
    const hashService = mock<HashService>();

    const handler = new LoginHandler(
        userRepository,
        hashService,
        mock<Logger>(),
    );

    afterEach(() => {
        mockReset(userRepository);
        mockReset(hashService);
    });

    describe('login', () => {
        it('should validate the login credentials correctly', async () => {
            const email = faker.internet.email();
            const password = 'Password1%';
            const hashedPassword = await hash(password, 10);
            const user = createTestUser({
                email,
                password: hashedPassword,
            });

            userRepository.findOneOrFail.mockResolvedValue(user);
            hashService.compare.mockResolvedValue(true);

            expect(
                await handler.execute({
                    data: { email, password },
                }),
            ).toBeTruthy();
        });

        it('should throw an error when the user is not active', async () => {
            const email = faker.internet.email();
            const password = 'Password1%';
            const user = createTestUser({
                email,
                password,
                state: UserState.Registering,
            });

            userRepository.findOneOrFail.mockResolvedValue(user);

            await expect(
                handler.execute({
                    data: { email, password },
                }),
            ).rejects.toThrow(InvalidUserState);
        });

        it('should throw an error when the passwords do not match', async () => {
            const email = faker.internet.email();
            const password = 'Password1%';
            const hashedPassword = await hash(`_${password}`, 10);
            const user = createTestUser({
                email,
                password: hashedPassword,
            });

            userRepository.findOneOrFail.mockResolvedValue(user);

            await expect(
                handler.execute({
                    data: { email, password },
                }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
