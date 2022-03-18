import { Property, Entity, Enum, OptionalProps } from '@mikro-orm/core';

import { BaseEntity, BaseOptionalProps } from './base.entity';

export enum UserState {
    Registering = 'REGISTERING',
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
}

@Entity()
export class User extends BaseEntity<User> {
    [OptionalProps]: BaseOptionalProps;

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
