import { NestFactory } from '@nestjs/core';

import { Logger, NestLoggerProxy } from '@libs/logger';

import { type WorkerConfig, workerConfig } from './worker.config';
import { WorkerModule } from './worker.module';

const API_PREFIX = 'api';

const bootstrap = async (): Promise<void> => {
    const app = await NestFactory.create(WorkerModule, {
        bufferLogs: true,
        autoFlushLogs: true,
        forceCloseConnections: true,
    });

    const logger = await app.resolve(Logger);
    logger.setContext('Bootstrap:Worker');

    app.useLogger(new NestLoggerProxy(await app.resolve(Logger)));

    logger.info('Successfully created nest app');

    app.setGlobalPrefix(API_PREFIX);

    app.enableShutdownHooks();

    const config = app.get<WorkerConfig>(workerConfig.KEY);

    await app.listen(config.worker.port);
    logger.info('App running', { port: config.worker.port });
};

bootstrap();
