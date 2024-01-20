import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { mock, instance, when, anything, reset } from '@typestrong/ts-mockito';
import { hash } from 'bcrypt';

import { Logger } from '@libs/logger';
import { UserRepository, UserState } from '@libs/models';
import { createTestUser } from '@libs/testing';

import { InvalidUserState } from '../auth.errors';
import { HashService } from '../services';

import { LoginHandler } from './login.command';

describe('LoginHandler', () => {
    const userRepository = mock(UserRepository);
    const hashService = mock(HashService);

    const handler = new LoginHandler(
        instance(userRepository),
        instance(hashService),
        instance(mock(Logger)),
    );

    afterEach(() => {
        reset(userRepository);
        reset(hashService);
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

            when(
                userRepository.findOneOrFail(anything(), anything()),
            ).thenResolve(user);
            when(hashService.compare(anything(), anything())).thenResolve(true);

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

            when(
                userRepository.findOneOrFail(anything(), anything()),
            ).thenResolve(user);

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

            when(
                userRepository.findOneOrFail(anything(), anything()),
            ).thenResolve(user);

            await expect(
                handler.execute({
                    data: { email, password },
                }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
