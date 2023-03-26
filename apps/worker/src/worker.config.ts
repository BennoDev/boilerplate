import { registerAs } from '@nestjs/config';

import { type Environment, tryGetEnv } from '@libs/common';

export interface WorkerConfig {
    environment: Environment;
    projectName: string;
}

export const workerConfig = registerAs<WorkerConfig>('worker', () => ({
    environment: tryGetEnv('NODE_ENV') as Environment,
    projectName: tryGetEnv('PROJECT_NAME'),
}));
