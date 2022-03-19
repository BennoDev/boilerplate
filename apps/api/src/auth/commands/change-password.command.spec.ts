import { Test, TestingModule } from '@nestjs/testing';
import { mock, instance, when, anything, reset } from 'ts-mockito';
import { hash } from 'bcrypt';

import { Logger } from '@libs/logger';
import { UserRepository } from '@libs/models';
import { createTestUser } from '@libs/testing';

import { InvalidOldPassword } from '../auth.errors';
import { ChangePasswordRequest } from '../dto';
import { ChangePasswordHandler } from './change-password.command';
import { createTestUserSession } from '../../common/testing';
import { HashService } from '../services';

describe('ChangePasswordHandler', () => {
    let module: TestingModule;
    let handler: ChangePasswordHandler;

    const userRepository = mock(UserRepository);
    const hashService = mock(HashService);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                ChangePasswordHandler,
                {
                    provide: HashService,
                    useValue: instance(hashService),
                },
                {
                    provide: Logger,
                    useValue: instance(mock(Logger)),
                },
                {
                    provide: UserRepository,
                    useValue: instance(userRepository),
                },
            ],
        }).compile();

        handler = module.get(ChangePasswordHandler);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(userRepository);
        reset(hashService);
    });

    describe('execute', () => {
        it('should successfully change password', async () => {
            const request: ChangePasswordRequest = {
                oldPassword: 'my_old_password',
                newPassword: 'my_new_password',
            };
            const user = createTestUser({
                password: await hash(request.oldPassword, 10),
            });

            when(userRepository.findOneOrFail(anything())).thenResolve(user);
            when(hashService.compare(anything(), anything())).thenResolve(true);
            when(hashService.hash(anything())).thenResolve('hashed');

            await handler.execute({
                data: request,
                session: createTestUserSession(),
            });

            expect(user.password).toBe('hashed');
        });

        it('should fail when the old password is wrong', async () => {
            const request: ChangePasswordRequest = {
                oldPassword: 'my_invalid_old_password',
                newPassword: 'my_new_password',
            };

            when(userRepository.findOneOrFail(anything())).thenResolve(
                createTestUser({ password: 'my_old_password' }),
            );

            await expect(
                handler.execute({
                    data: request,
                    session: createTestUserSession(),
                }),
            ).rejects.toThrowError(InvalidOldPassword);
        });
    });
});
