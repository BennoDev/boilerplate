import { AsyncLocalStorage } from 'node:async_hooks';

import {
    Global,
    Inject,
    type MiddlewareConsumer,
    Module,
    type NestModule,
    Scope,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

import { ContextStoreMiddleware } from './context-store.middleware';
import { ContextStore } from './context-store.service';
import { type LoggerConfig, loggerConfig } from './logger.config';
import { LoggerFactory } from './logger.factory';
import { LoggerMiddleware } from './logger.middleware';
import { Logger } from './logger.service';

@Global()
@Module({
    imports: [ConfigModule.forFeature(loggerConfig)],
    providers: [
        AsyncLocalStorage,
        ContextStore,
        LoggerFactory,
        {
            scope: Scope.TRANSIENT,
            provide: Logger,
            inject: [LoggerFactory, Reflector],
            useFactory: (factory: LoggerFactory): Logger => factory.getLogger(),
        },
    ],
    exports: [Logger, ContextStore],
})
export class LoggerModule implements NestModule {
    constructor(
        @Inject(loggerConfig.KEY) private readonly config: LoggerConfig,
    ) {}

    configure(consumer: MiddlewareConsumer): void {
        if (this.config.enableRequestLogging) {
            consumer.apply(ContextStoreMiddleware).forRoutes('*');
            consumer.apply(LoggerMiddleware).forRoutes('*');
        }
    }
}
