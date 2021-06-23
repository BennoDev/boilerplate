import { EntityCaseNamingStrategy, Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { join } from 'path';
import { config } from 'dotenv-safe';

/**
 * Get the env file according to current environment, if there is no specified, default to LOCAL
 */
config({
    path: join(__dirname, './.env'),
    example: join(__dirname, './.env.example'),
});

type Target = 'migrations' | 'seeds-dev' | 'seeds-stag' | 'seeds-prod';
const target: Target = (process.env.TARGET as Target) || 'migrations';

const dbConfig: Options<PostgreSqlDriver> = {
    type: 'postgresql',
    clientUrl: process.env.DATABASE_URL,
    driverOptions: { connection: { ssl: process.env.DATABASE_SSL === 'true' } },
    baseDir: process.cwd(),
    entities: ['./libs/models/src/entities'],
    entitiesTs: ['./libs/models/src/entities'],
    debug: true,
    namingStrategy: EntityCaseNamingStrategy,
    migrations: {
        tableName: target.toLowerCase(),
        path: join(__dirname, target.toLowerCase()),
        disableForeignKeys: false,
        allOrNothing: false,
    },
    highlighter: new SqlHighlighter(),
    forceUtcTimezone: true,
    cache: {
        pretty: true,
        options: { cacheDir: join(__dirname, 'cache') },
    },
};

// Have to default export for Mikro ORM CLI
// eslint-disable-next-line import/no-default-export
export default dbConfig;
