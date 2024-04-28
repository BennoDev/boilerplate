import { faker } from '@faker-js/faker';
import { mock, mockReset } from 'jest-mock-extended';

import { type UserRepository, UserState } from '@libs/models';
import { createTestUser } from '@libs/testing';

import { SessionSerializer } from './session-serializer.middleware';

describe('SessionSerializer', () => {
    const userRepository = mock<UserRepository>();

    const serializer = new SessionSerializer(userRepository);

    afterEach(() => {
        mockReset(userRepository);
    });

    it('should deserialize into a session from the cookie', async () => {
        const user = createTestUser({
            state: UserState.Active,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
        });
        userRepository.findOne.mockResolvedValue(user);

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
        expect({ userId: user.id, ...user }).toMatchObject(req.user);
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
