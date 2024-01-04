import {
    Property,
    Entity,
    Enum,
    OptionalProps,
    EntityRepositoryType,
} from '@mikro-orm/core';

import { BaseEntity, type BaseEntityOptionalProps } from '@libs/database';

import { UserRepository } from '../repositories';

export enum UserState {
    Registering = 'REGISTERING',
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
}

@Entity({ customRepository: () => UserRepository })
export class User extends BaseEntity<User> {
    [OptionalProps]!: BaseEntityOptionalProps;

    [EntityRepositoryType]?: UserRepository;

    @Property({ unique: true })
    email!: string;

    /**
     * Defaults to REGISTERING.
     */
    @Enum(() => UserState)
    state: UserState = UserState.Registering;

    @Property()
    password!: string;

    @Property()
    firstName!: string;

    @Property()
    lastName!: string;
}
