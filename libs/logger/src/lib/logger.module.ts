import {
    Global,
    Inject,
    type MiddlewareConsumer,
    Module,
    type NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggerConfig, loggerConfig } from './logger.config';
import { LoggerMiddleware } from './logger.middleware';
import { Logger } from './logger.service';

@Global()
@Module({
    imports: [ConfigModule.forFeature(loggerConfig)],
    providers: [Logger],
    exports: [Logger],
})
export class LoggerModule implements NestModule {
    constructor(
        @Inject(loggerConfig.KEY) private readonly config: LoggerConfig,
    ) {}

    configure(consumer: MiddlewareConsumer): void {
        if (this.config.enableRequestLogging) {
            consumer.apply(LoggerMiddleware).forRoutes('*');
        }
    }
}
