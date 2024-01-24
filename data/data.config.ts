import { join } from 'node:path';
import { question } from 'readline-sync';

import { Options, UnderscoreNamingStrategy } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { config } from 'dotenv-safe';

import { MigrationGenerator } from './migration-generator';
import { readdirSync } from 'node:fs';

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

/**
 * Allows us to properly name our migrations rather than the default Migration<TimeStamp> MikroORM uses.
 * Courtesy of https://github.com/mikro-orm/mikro-orm/issues/914#issuecomment-815129660.
 *
 * @param path Path where the migration will be located.
 */
const migrationFileName = (path: string): string => {
    const delimiter = '-';

    // Get the last migration
    const lastFileName = readdirSync(path).pop();
    let counter = 1;

    if (lastFileName) {
        // Increment the counter based on the last migration
        counter = parseInt(lastFileName.split(delimiter)[0], 10) + 1;
    }

    // Ask user for a short description (keep asking until you get something or they quit with ctrl+c)
    let name = '';
    while (!name) {
        name = question(
            '\nWhat is the name of the new migration (kebab-cased)\n> ',
        )
            // Replace any number of whitespace characters with the delimiter
            .replace(/\s+/gi, delimiter)
            .toLowerCase();
    }

    /**
     * Assigning to an environment variable here so we can easily access it in other files during generation.
     * There is no risk of conflicts as any existing variable would be overwritten here for the duration of the script.
     */
    process.env.MIGRATION_NAME = name;

    // New line to find question in logs easier
    console.log();

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
