import { join } from 'node:path';

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModuleOptions, ConfigModule } from '@nestjs/config';

import { Environment, tryGetEnv } from '@libs/core';
import { DatabaseModule } from '@libs/database';
import { LoggerModule } from '@libs/logger';
import { User } from '@libs/models';

import { getRedisClient } from './redis.client';
import { WorkerConfig, workerConfig } from './worker.config';
import { WorkerProcessor } from './worker.processor';

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
    load: [workerConfig],
};
const configOptions: ConfigModuleOptions = isRemoteEnvironment
    ? { ignoreEnvFile: true, ...baseConfigOptions }
    : { envFilePath: [join(__dirname, '.env')], ...baseConfigOptions };

@Module({
    imports: [
        ConfigModule.forRoot(configOptions),
        BullModule.forRootAsync({
            imports: [ConfigModule.forFeature(workerConfig)],
            inject: [workerConfig.KEY],
            useFactory: (config: WorkerConfig) => ({
                connection: getRedisClient(config),
                prefix: '[bullmq]',
                // TODO: Check this!
                // telemetry: {}
            }),
        }),
        BullModule.registerQueue({
            name: 'worker',
            // TODO: Check this!
            // telemetry: {}
        }),
        LoggerModule,
        DatabaseModule.register([User]),
    ],
    providers: [WorkerProcessor],
})
export class WorkerModule {}
