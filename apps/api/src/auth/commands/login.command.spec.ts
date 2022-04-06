import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcrypt';
import { mock, instance, when, anything, reset } from 'ts-mockito';

import { Logger } from '@libs/logger';
import { UserRepository, UserState } from '@libs/models';
import { createTestUser } from '@libs/testing';

import { UserStateNotAllowed } from '../auth.errors';
import { HashService } from '../services';

import { LoginHandler } from './login.command';

describe('LoginHandler', () => {
    let module: TestingModule;
    let handler: LoginHandler;

    const userRepository = mock(UserRepository);
    const hashService = mock(HashService);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                LoginHandler,
                {
                    provide: Logger,
                    useValue: instance(mock(Logger)),
                },
                {
                    provide: UserRepository,
                    useValue: instance(userRepository),
                },
                {
                    provide: HashService,
                    useValue: instance(hashService),
                },
            ],
        }).compile();

        handler = module.get(LoginHandler);
    });

    afterAll(async () => {
        await module.close();
    });

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
            ).rejects.toThrowError(UserStateNotAllowed);
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
            ).rejects.toThrowError(UnauthorizedException);
        });
    });
});
