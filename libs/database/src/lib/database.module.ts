import { join } from 'node:path';

import {
    type Highlighter,
    type LoggerNamespace,
    type AnyEntity,
    type EntityClass,
} from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { type DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { Environment } from '@libs/core';
import { Logger } from '@libs/logger';

import { type DatabaseConfig, databaseConfig } from './database.config';

export class DatabaseModule {
    static register(entities: Array<EntityClass<AnyEntity>>): DynamicModule {
        return {
            module: DatabaseModule,
            imports: [
                MikroOrmModule.forRootAsync({
                    imports: [ConfigModule.forFeature(databaseConfig)],
                    inject: [Logger, databaseConfig.KEY],
                    useFactory: (logger: Logger, config: DatabaseConfig) => {
                        logger.setContext('Database');

                        return {
                            ...config,
                            logger: message => logger.info(message),
                            debug: this.getDebugOptions(config.environment),
                            highlighter: this.getHighlighter(
                                config.environment,
                            ),
                        };
                    },
                }),
                MikroOrmModule.forFeature(entities),
            ],
            exports: [MikroOrmModule],
        };
    }

    /**
     * Use this method to register a database module for an integration test.
     * The difference between this and `register` is that there is no
     * custom logger implementation & using global context is allowed.
     */
    static registerTest(
        entities: Array<EntityClass<AnyEntity>>,
    ): DynamicModule {
        return {
            module: DatabaseModule,
            imports: [
                MikroOrmModule.forRootAsync({
                    imports: [
                        ConfigModule.forRoot({
                            load: [databaseConfig],
                            envFilePath: join(__dirname, '.env.test'),
                        }),
                    ],
                    inject: [databaseConfig.KEY],
                    useFactory: (config: DatabaseConfig) => ({
                        ...config,
                        allowGlobalContext: true,
                    }),
                }),
                MikroOrmModule.forFeature(entities),
            ],
            exports: [MikroOrmModule],
        };
    }

    /**
     * Configures debug (logging) options based on environment for MikroORM db queries.
     */
    private static getDebugOptions(
        environment: Environment,
    ): LoggerNamespace[] | boolean {
        return [
            Environment.Local,
            Environment.Development,
            Environment.Test,
        ].includes(environment)
            ? true
            : ['info'];
    }

    /**
     * Gets a highlighter for logged queries to increase readability.
     * Disabled / enabled based on environment.
     */
    private static getHighlighter(
        environment: Environment,
    ): Highlighter | undefined {
        return [Environment.Local, Environment.Test].includes(environment)
            ? new SqlHighlighter()
            : undefined;
    }
}
