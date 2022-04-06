import { DynamicModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createNamespace } from 'cls-hooked';

import { loggerConfig } from './logger.config';
import { namespaceToken } from './logger.constants';
import { Logger } from './logger.service';
import { TraceMiddleware } from './trace.middleware';

let registered = false;

export class LoggerModule {
    /**
     * Registers a logger module that is available *GLOBALLY*.
     * Only register this ONCE per running application.
     */
    static register(): DynamicModule {
        if (registered) {
            throw new Error(
                'LoggerModule can not be registered more than once',
            );
        }
        registered = true;

        return {
            global: true,
            imports: [ConfigModule.forFeature(loggerConfig)],
            module: LoggerModule,
            providers: [
                {
                    provide: namespaceToken,
                    useValue: createNamespace('Logger'),
                },
                Logger,
            ],
            exports: [Logger, namespaceToken],
        };
    }

    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(TraceMiddleware).forRoutes('*');
    }
}
