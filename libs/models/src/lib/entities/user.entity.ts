import {
    Property,
    Entity,
    Enum,
    EntityRepositoryType,
    Opt,
} from '@mikro-orm/core';

import { BaseEntity } from '@libs/database';

import { UserRepository } from '../repositories';

export enum UserState {
    Registering = 'REGISTERING',
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
}

@Entity({ repository: () => UserRepository })
export class User extends BaseEntity {
    [EntityRepositoryType]?: UserRepository;

    @Property({ unique: true })
    email!: string;

    /**
     * Defaults to REGISTERING.
     */
    @Enum({ items: () => UserState, defaultRaw: `'${UserState.Registering}'` })
    state: Opt<UserState> = UserState.Registering;

    @Property()
    password!: string;

    @Property()
    firstName!: string;

    @Property()
    lastName!: string;
}
