import { faker } from '@faker-js/faker';
import { anything, instance, mock, reset, when } from 'ts-mockito';

import { UserRepository, UserState } from '@libs/models';
import { createTestUser } from '@libs/testing';

import { createTestUserSession } from '../../common';

import { SessionSerializer } from './session-serializer.middleware';

describe('SessionSerializer', () => {
    const userRepository = mock(UserRepository);

    const serializer = new SessionSerializer(instance(userRepository));

    afterEach(() => {
        reset(userRepository);
    });

    it('should deserialize into a session from the cookie', async () => {
        const user = createTestUser({
            state: UserState.Active,
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
        });
        const session = createTestUserSession({
            userId: user.id,
            ...user,
        });
        when(userRepository.findOne(anything())).thenResolve(user);

        const mockNext = jest.fn();
        const req: any = {
            session: {
                userId: user.id,
            },
            // Defining here to avoid type errors below
            user: undefined,
        };

        await serializer.use(req, {} as any, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(session).toMatchObject(req.user);
    });

    it('should continue if no cookie is present', async () => {
        const mockNext = jest.fn();
        const req: any = {
            session: {},
            user: undefined,
        };

        await serializer.use(req, {} as any, mockNext);

        expect(mockNext).toHaveBeenCalled();
        // Verifying that it did not mutate in the serializer
        expect(req.user).toBeUndefined();
    });
});
