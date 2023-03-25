import { Property, Entity, Enum, OptionalProps } from '@mikro-orm/core';

import { UserRepository } from '../repositories/user.repository';

import { BaseEntity, type BaseOptionalProps } from './base.entity';

export enum UserState {
    Registering = 'REGISTERING',
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
}

@Entity({ customRepository: () => UserRepository })
export class User extends BaseEntity<User> {
    [OptionalProps]!: BaseOptionalProps;

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
