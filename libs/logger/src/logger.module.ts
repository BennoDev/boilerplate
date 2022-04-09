import {
    Global,
    Inject,
    MiddlewareConsumer,
    Module,
    NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AsyncLocalStorage } from 'async_hooks';

import { ContextStoreMiddleware } from './context-store.middleware';
import { ContextStore } from './context-store.service';
import { LoggerConfig, loggerConfig } from './logger.config';
import { Logger } from './logger.service';

@Global()
@Module({
    imports: [ConfigModule.forFeature(loggerConfig)],
    providers: [Logger, AsyncLocalStorage, ContextStore],
    exports: [Logger, ContextStore],
})
export class LoggerModule implements NestModule {
    constructor(
        @Inject(loggerConfig.KEY) private readonly config: LoggerConfig,
    ) {}

    configure(consumer: MiddlewareConsumer): void {
        if (this.config.enableRequestTracing) {
            consumer.apply(ContextStoreMiddleware).forRoutes('*');
        }
    }
}
