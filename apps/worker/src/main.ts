import { NestFactory } from '@nestjs/core';

import { Logger, NestLoggerProxy } from '@libs/logger';

import { WorkerModule } from './worker.module';

const context = 'Bootstrap:Worker';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(WorkerModule);
    const logger = app.get(Logger);
    app.useLogger(new NestLoggerProxy(logger));

    logger.info('Worker running...', { context });
}

bootstrap();
