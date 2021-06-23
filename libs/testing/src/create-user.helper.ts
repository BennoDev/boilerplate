import * as faker from 'faker';

import { User, UserState } from '@libs/models';

export function createTestUser(overrides?: Partial<User>): User {
    const user = new User();

    user.id = overrides?.id || faker.datatype.uuid();
    user.email = overrides?.email || faker.internet.email();
    user.password = overrides?.password || faker.internet.password();
    user.state = overrides?.state || UserState.Active;
    user.firstName = overrides?.firstName || faker.name.firstName();
    user.lastName = overrides?.lastName || faker.name.lastName();
    user.createdAt = overrides?.createdAt || new Date();
    user.updatedAt = overrides?.updatedAt || new Date();

    return user;
}
