import { EntityRepository } from '@mikro-orm/postgresql';

import { type User } from '../entities';

export class UserRepository extends EntityRepository<User> {}
