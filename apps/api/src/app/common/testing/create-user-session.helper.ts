import { randomUUID } from 'node:crypto';

import { faker } from '@faker-js/faker';
import { mergeDeepRight } from 'ramda';

import { UserState } from '@libs/models';

import { type UserSession } from '../common.types';

export const createTestUserSession = (
    overrides: Partial<UserSession> = {},
): UserSession =>
    mergeDeepRight(
        {
            userId: randomUUID(),
            email: faker.internet.email(),
            state: UserState.Active,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
        },
        overrides,
    );
