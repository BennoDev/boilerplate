import { faker } from '@faker-js/faker';
import { mergeDeepRight } from 'ramda';

import { UserState } from '@libs/models';

import { type UserSession } from '../common.types';

export const createTestUserSession = (
    overrides: Partial<UserSession> = {},
): UserSession =>
    mergeDeepRight(
        {
            userId: faker.datatype.uuid(),
            email: faker.internet.email(),
            state: UserState.Active,
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
        },
        overrides,
    );
