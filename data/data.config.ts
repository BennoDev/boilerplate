import { join } from 'path';

import { Options, UnderscoreNamingStrategy } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { config } from 'dotenv-safe';
import { MigrationGenerator } from './migration-generator';
import { migrationFileName } from './data.utils';

/**
 * The environments here have to be the same as mentioned in libs/common/core/src/lib/common.constants.ts.
 */
const isRemoteEnvironment = ['staging', 'production'].includes(
    process.env.NODE_ENV as string,
);

/**
 * Get the env file according to current environment, if there is no specified, default to LOCAL
 */
if (!isRemoteEnvironment) {
    config({
        example: join(__dirname, './.env.example'),
        path: join(__dirname, './.env'),
    });
}

const baseConfig: Options<PostgreSqlDriver> = {
    namingStrategy: UnderscoreNamingStrategy,
    baseDir: process.cwd(),
    clientUrl: process.env.DATABASE_URL,
    discovery: { warnWhenNoEntities: false },
    driverOptions: {
        connection: {
            ssl:
                process.env.DATABASE_SSL === 'true'
                    ? { rejectUnauthorized: false }
                    : false,
        },
    },
    entities: [],
    forceUtcTimezone: true,
    persistOnCreate: false,
    migrations: {
        allOrNothing: false,
        disableForeignKeys: false,
        path: join(__dirname, 'migrations'),
        tableName: 'migrations',
        snapshot: false,
        generator: MigrationGenerator,
        fileName: () => migrationFileName(join(__dirname, 'migrations')),
    },
    type: 'postgresql',
};

const localConfig: Options<PostgreSqlDriver> = {
    cache: {
        options: { cacheDir: join(__dirname, 'cache') },
        pretty: true,
    },
    debug: true,
    entities: ['./apps/**/*.entity.ts', './libs/**/*.entity.ts'],
    highlighter: new SqlHighlighter(),
    seeder: {
        path: join(__dirname, 'seeders'),
    },
};

const remoteConfig: Options<PostgreSqlDriver> = {
    discovery: { warnWhenNoEntities: false },
};

const dataConfig: Options<PostgreSqlDriver> = isRemoteEnvironment
    ? { ...baseConfig, ...remoteConfig }
    : { ...baseConfig, ...localConfig };

export default dataConfig;
