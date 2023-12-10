import { registerAs } from '@nestjs/config';

import { type Environment, tryGetEnv } from '@libs/core';

export type WorkerConfig = {
    environment: Environment;
    projectName: string;
    worker: {
        port: string;
    };
};

export const workerConfig = registerAs<WorkerConfig>('worker', () => ({
    environment: tryGetEnv('NODE_ENV') as Environment,
    projectName: tryGetEnv('PROJECT_NAME'),
    worker: {
        port: tryGetEnv('PORT'),
    },
}));
