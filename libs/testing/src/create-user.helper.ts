import { faker } from '@faker-js/faker';
import { plainToInstance } from 'class-transformer';
import { mergeDeepRight } from 'ramda';

import { User, UserState } from '@libs/models';

export function createTestUser(overrides: Partial<User> = {}): User {
    return plainToInstance(
        User,
        mergeDeepRight(
            {
                id: overrides?.id || faker.datatype.uuid(),
                email: overrides?.email || faker.internet.email(),
                password: overrides?.password || faker.internet.password(),
                state: overrides?.state || UserState.Active,
                firstName: overrides?.firstName || faker.name.firstName(),
                lastName: overrides?.lastName || faker.name.lastName(),
                createdAt: overrides?.createdAt || new Date(),
                updatedAt: overrides?.updatedAt || new Date(),
            },
            overrides,
        ),
    );
}
