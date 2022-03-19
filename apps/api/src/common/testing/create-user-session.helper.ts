import { faker } from '@faker-js/faker';
import { mergeDeepRight } from 'ramda';

import { UserState } from '@libs/models';

import { UserSession } from '../common.types';

export function createTestUserSession(
    overrides: Partial<UserSession> = {},
): UserSession {
    return mergeDeepRight({
        userId: faker.datatype.uuid(),
        email: faker.internet.email(),
        state: UserState.Active,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
    }, overrides);
}
