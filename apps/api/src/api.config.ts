import { registerAs } from '@nestjs/config';

import { Environment, tryGetEnv } from '@libs/common';

export type ApiConfig = {
    environment: Environment;
    projectName: string;
    redisUrl: string;
    session: {
        secret: string;
        expiresIn: number;
    };
    api: {
        rateLimit: number;
        allowedOrigins: string[];
        port: string;
    };
    swagger: {
        path?: string;
        username?: string;
        password?: string;
    };
};

export const apiConfig = registerAs<ApiConfig>('app', () => ({
    environment: tryGetEnv('NODE_ENV') as Environment,
    projectName: tryGetEnv('PROJECT_NAME'),
    redisUrl: tryGetEnv('REDIS_URL'),
    session: {
        expiresIn: parseInt(tryGetEnv('SESSION_TTL'), 10),
        secret: tryGetEnv('SESSION_SECRET'),
    },
    api: {
        rateLimit: parseInt(tryGetEnv('REQUESTS_PER_MINUTE'), 10),
        allowedOrigins: tryGetEnv('ALLOWED_ORIGINS').split(','),
        port: tryGetEnv('PORT'),
    },
    swagger: {
        path: process.env.SWAGGER_PATH,
        username: process.env.SWAGGER_USERNAME,
        password: process.env.SWAGGER_PASSWORD,
    },
}));
