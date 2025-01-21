import { join } from 'node:path';

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, type ConfigModuleOptions } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { minutesToMilliseconds } from 'date-fns';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

import { Environment, tryGetEnv } from '@libs/core';
import { LoggerModule } from '@libs/logger';

import { type ApiConfig, apiConfig } from './api.config';
import { AuthModule } from './auth';
import { HealthModule } from './health';
import { getRedisClient } from './redis.client';

const isRemoteEnvironment = [
    Environment.Development,
    Environment.Staging,
    Environment.Production,
].includes(tryGetEnv('NODE_ENV') as Environment);

/**
 * On remote, we expect our config vars to be present in the runtime OS (via Heroku config for example).
 * Locally or while testing, we can use an .env file.
 */
const baseConfigOptions: ConfigModuleOptions = {
    load: [apiConfig],
};
const configOptions: ConfigModuleOptions = isRemoteEnvironment
    ? { ignoreEnvFile: true, ...baseConfigOptions }
    : { envFilePath: [join(__dirname, '.env')], ...baseConfigOptions };

@Module({
    imports: [
        ConfigModule.forRoot(configOptions),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule.forFeature(apiConfig)],
            inject: [apiConfig.KEY],
            useFactory: (config: ApiConfig) => ({
                storage: new ThrottlerStorageRedisService(
                    getRedisClient(config),
                ),
                throttlers: [
                    {
                        name: 'per-minute',
                        ttl: minutesToMilliseconds(1),
                        limit: config.api.rateLimit,
                    },
                ],
            }),
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule.forFeature(apiConfig)],
            inject: [apiConfig.KEY],
            useFactory: (config: ApiConfig) => ({
                connection: getRedisClient(config),
                prefix: '[bullmq]',
            }),
        }),
        LoggerModule,
        HealthModule,
        AuthModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class ApiModule {}
