import { registerAs } from '@nestjs/config';

import { type Environment, tryGetEnv } from '@libs/core';

export type WorkerConfig = {
    environment: Environment;
    projectName: string;
    redis: {
        host: string;
        port: number;
    };
};

export const workerConfig = registerAs<WorkerConfig>('worker', () => ({
    environment: tryGetEnv('NODE_ENV') as Environment,
    projectName: tryGetEnv('PROJECT_NAME'),
    redis: {
        host: tryGetEnv('REDIS_HOST'),
        port: parseInt(tryGetEnv('REDIS_PORT'), 10),
    },
}));
