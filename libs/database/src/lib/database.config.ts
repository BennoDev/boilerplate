import { UnderscoreNamingStrategy } from '@mikro-orm/core';
import { type MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { registerAs } from '@nestjs/config';

import { type Environment, tryGetEnv } from '@libs/core';

export type DatabaseConfig = MikroOrmModuleOptions & {
    environment: Environment;
};

export const databaseConfig = registerAs<DatabaseConfig>('database', () => ({
    autoLoadEntities: true,
    namingStrategy: UnderscoreNamingStrategy,
    driver: PostgreSqlDriver,
    clientUrl: tryGetEnv('DATABASE_URL'),
    environment: tryGetEnv('NODE_ENV') as Environment,
    driverOptions: {
        connection: { ssl: tryGetEnv('DATABASE_SSL') === 'true' },
    },
    forceUtcTimezone: true,
}));
