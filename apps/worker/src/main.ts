import { NestFactory } from '@nestjs/core';

import { Logger, NestLoggerProxy } from '@libs/logger';

import { WorkerModule } from './app/worker.module';

const bootstrap = async (): Promise<void> => {
    const app = await NestFactory.createApplicationContext(WorkerModule, {
        bufferLogs: true,
        autoFlushLogs: true,
    });

    const logger = await app.resolve(Logger);
    logger.setContext('Bootstrap:Worker');

    app.useLogger(new NestLoggerProxy(await app.resolve(Logger)));

    logger.info('Successfully created nest app');

    app.enableShutdownHooks();

    logger.info('App running');
};

bootstrap();
