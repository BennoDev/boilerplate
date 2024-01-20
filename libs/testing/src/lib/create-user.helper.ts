import { randomUUID } from 'node:crypto';

import { faker } from '@faker-js/faker';
import { plainToInstance } from 'class-transformer';
import { mergeDeepRight } from 'ramda';

import { User, UserState } from '@libs/models';

export const createTestUser = (overrides: Partial<User> = {}): User =>
    plainToInstance(
        User,
        mergeDeepRight(
            {
                id: overrides.id ?? randomUUID(),
                email: overrides.email ?? faker.internet.email(),
                password: overrides.password ?? faker.internet.password(),
                state: overrides.state ?? UserState.Active,
                firstName: overrides.firstName ?? faker.person.firstName(),
                lastName: overrides.lastName ?? faker.person.lastName(),
                createdAt: overrides.createdAt ?? new Date(),
                updatedAt: overrides.updatedAt ?? new Date(),
            },
            overrides,
        ),
    );
