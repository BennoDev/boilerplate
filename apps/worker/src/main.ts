import { NestFactory } from '@nestjs/core';
import throng from 'throng';

import { Environment, tryGetEnv } from '@libs/common';
import { Logger, NestLoggerProxy } from '@libs/logger';

import { WorkerModule } from './worker.module';

const isProductionLikeEnvironment = [
    Environment.Production,
    Environment.Staging,
].includes(tryGetEnv('NODE_ENV') as Environment);

const context = 'Bootstrap:Worker';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(WorkerModule);
    const logger = app.get(Logger);
    app.useLogger(new NestLoggerProxy(logger));

    logger.info('Worker running...', { context });
}

function run(): void {
    if (isProductionLikeEnvironment) {
        throng({
            workers: process.env.WORKERS || 1,
            start: bootstrap,
            lifetime: Infinity,
        });
    } else {
        bootstrap();
    }
}

run();
