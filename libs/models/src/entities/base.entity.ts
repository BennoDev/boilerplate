import {
    PrimaryKey,
    Property,
    BaseEntity as MikroOrmBaseEntity,
    Entity,
    AnyEntity,
} from '@mikro-orm/core';
import * as uuid from 'uuid';

export type BaseOptionalProps = 'createdAt' | 'updatedAt';

/**
 * Base class for entities, provides identity and basic created / update auditing fields.
 */
@Entity({ abstract: true })
export abstract class BaseEntity<
    ConcreteEntity extends AnyEntity,
> extends MikroOrmBaseEntity<ConcreteEntity, 'id'> {
    @PrimaryKey({ type: 'uuid', defaultRaw: 'uuid_generate_v4()' })
    id = uuid.v4();

    @Property({ onCreate: () => new Date(), columnType: 'timestamptz(3)' })
    createdAt = new Date();

    @Property({ onUpdate: () => new Date(), columnType: 'timestamptz(3)' })
    updatedAt = new Date();
}
