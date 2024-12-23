import { AsyncLocalStorage } from 'node:async_hooks';

import {
    Global,
    Inject,
    type MiddlewareConsumer,
    Module,
    type NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ContextStoreMiddleware } from './context-store.middleware';
import { ContextStore } from './context-store.service';
import { LoggerConfig, loggerConfig } from './logger.config';
import { LoggerMiddleware } from './logger.middleware';
import { Logger } from './logger.service';
import { setupOtel } from './otel.instrumentation';

@Global()
@Module({
    imports: [ConfigModule.forFeature(loggerConfig)],
    providers: [Logger, AsyncLocalStorage, ContextStore],
    exports: [Logger, ContextStore],
})
export class LoggerModule implements NestModule {
    constructor(
        @Inject(loggerConfig.KEY) private readonly config: LoggerConfig,
    ) {
        setupOtel(this.config.projectName);
    }

    configure(consumer: MiddlewareConsumer): void {
        if (this.config.enableRequestLogging) {
            consumer.apply(ContextStoreMiddleware).forRoutes('*');
            consumer.apply(LoggerMiddleware).forRoutes('*');
        }
    }
}
