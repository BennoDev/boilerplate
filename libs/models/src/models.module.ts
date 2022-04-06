import { Highlighter, LoggerNamespace } from '@mikro-orm/core';
import { AnyEntity, EntityClass } from '@mikro-orm/core/typings';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

import { Environment } from '@libs/common';
import { Logger } from '@libs/logger';

import { User } from './entities';
import { ModelsConfig, modelsConfig } from './models.config';

// Add all entities to this array, to register them and their repositories.
const entities: Array<EntityClass<AnyEntity>> = [User];

export class ModelsModule {
    static register(): DynamicModule {
        return {
            module: ModelsModule,
            imports: [
                MikroOrmModule.forRootAsync({
                    imports: [ConfigModule.forFeature(modelsConfig)],
                    inject: [Logger, modelsConfig.KEY],
                    useFactory: async (
                        logger: Logger,
                        config: ModelsConfig,
                    ) => ({
                        ...config,
                        autoLoadEntities: true,
                        logger: message =>
                            logger.info(message, { context: 'Database' }),
                        debug: this.getDebugOptions(config.environment),
                        forceUtcTimezone: true,
                        highlighter: this.getHighlighter(config.environment),
                    }),
                }),
                MikroOrmModule.forFeature(entities),
            ],
            exports: [MikroOrmModule],
        };
    }

    /**
     * Use this method to register a database module for an integration test.
     * The difference between this and `register` is that there is no
     * custom logger implementation.
     */
    static registerTest(): DynamicModule {
        return {
            module: ModelsModule,
            imports: [
                MikroOrmModule.forRootAsync({
                    imports: [
                        ConfigModule.forRoot({
                            load: [modelsConfig],
                            envFilePath: join(__dirname, '.env.test'),
                        }),
                    ],
                    inject: [modelsConfig.KEY],
                    useFactory: (config: ModelsConfig) => ({
                        ...config,
                        entities,
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
