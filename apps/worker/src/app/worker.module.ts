import { join } from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule, type ConfigModuleOptions } from '@nestjs/config';

import { Environment, tryGetEnv } from '@libs/core';
import { LoggerModule } from '@libs/logger';

import { HealthModule } from './health';
import { workerConfig } from './worker.config';

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
    imports: [ConfigModule.forRoot(configOptions), LoggerModule, HealthModule],
})
export class WorkerModule {}
