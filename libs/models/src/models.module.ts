import { DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Highlighter, LoggerNamespace } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AnyEntity, EntityClass } from '@mikro-orm/core/typings';
import { join } from 'path';

import { Logger } from '@libs/logger';
import { Environment } from '@libs/common';

import { ModelsConfig, modelsConfig } from './models.config';
import { User } from './entities';

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

    private static getHighlighter(
        environment: Environment,
    ): Highlighter | undefined {
        return [Environment.Local, Environment.Test].includes(environment)
            ? new SqlHighlighter()
            : undefined;
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
                    }),
                }),
                MikroOrmModule.forFeature(entities),
            ],
            exports: [MikroOrmModule],
        };
    }
}
