import { Module } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { join } from 'path';

import { Environment, tryGetEnv } from '@libs/common';
import { LoggerInterceptor, LoggerModule } from '@libs/logger';

import { ApiConfig, apiConfig } from './api.config';
import { AuthModule } from './auth/auth.module';
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
                // This is in seconds, we always want to count requests / minute for ease of reasoning.
                ttl: 60,
                limit: config.api.rateLimit,
                storage: new ThrottlerStorageRedisService(
                    getRedisClient(config),
                ),
            }),
        }),
        LoggerModule,
        AuthModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggerInterceptor,
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class ApiModule {}
