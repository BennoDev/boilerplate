import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { type Options, UnderscoreNamingStrategy } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { config } from 'dotenv-safe';

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

const migrationFileName = (_timestamp: string, name?: string): string => {
    const path = join(__dirname, 'migrations');
    const delimiter = '-';

    // Get the last migration
    const lastFileName = readdirSync(path).pop();
    let counter = 1;

    if (lastFileName) {
        // Increment the counter based on the last migration
        counter = parseInt(lastFileName.split(delimiter)[0], 10) + 1;
    }

    return `${counter.toString().padStart(4, '0')}-${name}.migration`;
};

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
        fileName: migrationFileName,
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

// MikroORM configuration expects a default export
// eslint-disable-next-line import/no-default-export
export default dataConfig;
