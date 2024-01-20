import { EntityRepository } from '@mikro-orm/core';

import { type User } from '../entities';

export class UserRepository extends EntityRepository<User> {}
