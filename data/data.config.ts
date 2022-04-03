import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { join } from 'path';
import { config } from 'dotenv-safe';

import { migrationFileName } from './data.utils';
import { MigrationGenerator } from './migration-generator';

/**
 * The environments here have to be the same as mentioned in libs/common/common.constants.ts.
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

type Target = 'migrations' | 'seeds_dev' | 'seeds_stag' | 'seeds_prod';
const target: Target = (process.env.TARGET as Target) || 'migrations';

const migrationsPath = join(__dirname, target.toLowerCase());
const baseConfig: Options<PostgreSqlDriver> = {
    baseDir: process.cwd(),
    clientUrl: process.env.DATABASE_URL,
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
    migrations: {
        allOrNothing: false,
        disableForeignKeys: false,
        path: migrationsPath,
        tableName: target.toLowerCase(),
        snapshot: false,
        fileName: () => migrationFileName(migrationsPath),
        generator: MigrationGenerator,
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
};

const remoteConfig: Options<PostgreSqlDriver> = {
    discovery: { warnWhenNoEntities: false },
};

const dataConfig: Options<PostgreSqlDriver> = isRemoteEnvironment
    ? { ...baseConfig, ...remoteConfig }
    : { ...baseConfig, ...localConfig };

// eslint-disable-next-line import/no-default-export
export default dataConfig;
