import { join } from 'node:path';

import { Options, UnderscoreNamingStrategy } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { config } from 'dotenv-safe';

import { migrationFileName } from './data.utils';
import { MigrationGenerator } from './migration-generator';

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
    driver: PostgreSqlDriver,
    extensions: [Migrator, SeedManager],
};

const localConfig: Options<PostgreSqlDriver> = {
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
