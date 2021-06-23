import * as faker from 'faker';

import { UserState } from '@libs/models';

import { UserSession } from '../common.types';

export function createTestUserSession(
    overrides?: Partial<UserSession>,
): UserSession {
    return {
        userId: overrides?.userId || faker.datatype.uuid(),
        email: overrides?.email || faker.internet.email(),
        state: overrides?.state || UserState.Active,
        firstName: overrides?.firstName || faker.name.firstName(),
        lastName: overrides?.lastName || faker.name.lastName(),
    };
}
