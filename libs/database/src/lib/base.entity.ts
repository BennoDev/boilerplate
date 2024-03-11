import { type UUID, randomUUID } from 'node:crypto';

import {
    PrimaryKey,
    Property,
    BaseEntity as MikroOrmBaseEntity,
    Entity,
    Opt,
} from '@mikro-orm/core';

/**
 * Base class for entities, provides identity and basic created / update auditing fields.
 */
@Entity({ abstract: true })
export abstract class BaseEntity extends MikroOrmBaseEntity {
    @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
    id: Opt<UUID> = randomUUID();

    @Property({
        onCreate: () => new Date(),
        columnType: 'timestamptz(3)',
        defaultRaw: 'now()',
    })
    createdAt!: Opt<Date>;

    @Property({
        onCreate: () => new Date(),
        onUpdate: () => new Date(),
        columnType: 'timestamptz(3)',
        defaultRaw: 'now()',
    })
    updatedAt!: Opt<Date>;
}
