import { randomUUID } from 'node:crypto';

import { faker } from '@faker-js/faker';

import { User, UserState } from '@libs/models';

export const createTestUser = (overrides: Partial<User> = {}): User => {
    const user = new User();

    user.id = overrides.id ?? randomUUID();
    user.email = overrides.email ?? faker.internet.email();
    user.password = overrides.password ?? faker.internet.password();
    user.state = overrides.state ?? UserState.Active;
    user.firstName = overrides.firstName ?? faker.person.firstName();
    user.lastName = overrides.lastName ?? faker.person.lastName();
    user.createdAt = overrides.createdAt ?? new Date();
    user.updatedAt = overrides.updatedAt ?? new Date();

    return user;
};
