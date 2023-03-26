import { join } from 'node:path';

import { EntityCaseNamingStrategy, type Options } from '@mikro-orm/core';
import { type PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { config } from 'dotenv-safe';

import { migrationFileName, toPascalCase } from './data.utils';
import { MigrationGenerator } from './migration-generator';

// The environments here have to be the same as mentioned in libs/common/common.constants.ts.
const isRemoteEnvironment = ['staging', 'production'].includes(
    process.env.NODE_ENV!,
);

// Get the env file according to current environment, if there is no specified, default to LOCAL
if (!isRemoteEnvironment) {
    config({
        example: join(__dirname, './.env.example'),
        path: join(__dirname, './.env'),
    });
}

type Target = 'migrations' | 'seeds-dev' | 'seeds-stag' | 'seeds-prod';
const target = (process.env.TARGET ?? 'migrations') as Target;

const migrationsPath = join(__dirname, target.toLowerCase());
const baseConfig: Options<PostgreSqlDriver> = {
    namingStrategy: EntityCaseNamingStrategy,
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
        /*
         * Change from kebab case to pascal case for the table name, for consistency with casing strategy.
         * This would change seeds-dev to SeedsDev for example.
         */
        tableName: toPascalCase(target.toLowerCase()),
        snapshot: false,
        fileName: () => migrationFileName(migrationsPath),
        generator: MigrationGenerator,
    },
    seeder: {},
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

// We need a default export here for the config, in order for MikroORM to process this.
// eslint-disable-next-line import/no-default-export
export default dataConfig;
