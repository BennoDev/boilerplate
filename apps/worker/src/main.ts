import { NestFactory } from '@nestjs/core';

import { Logger, NestLoggerProxy } from '@libs/logger';

import { WorkerModule } from './worker.module';

const bootstrap = async (): Promise<void> => {
    const app = await NestFactory.createApplicationContext(WorkerModule, {
        bufferLogs: true,
        autoFlushLogs: true,
    });

    const logger = await app.resolve(Logger);
    logger.setContext('Bootstrap:Worker');

    app.useLogger(new NestLoggerProxy(await app.resolve(Logger)));

    app.enableShutdownHooks();

    logger.info('Worker running...');
};

bootstrap();
