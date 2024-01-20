import { registerAs } from '@nestjs/config';

import { type Environment, tryGetEnv } from '@libs/core';

import { type LogLevel } from './logger.types';

export type LoggerConfig = {
    readonly environment: Environment;
    readonly logLevel: LogLevel;
    /**
     * Enable middleware that will log all incoming requests and responses.
     * Also creates a request context with a trace id that will automatically be added to all logs within the same request.
     */
    readonly enableRequestLogging: boolean;
};

export const loggerConfig = registerAs<LoggerConfig>('logger', () => ({
    enableRequestLogging: Boolean(tryGetEnv('ENABLE_REQUEST_LOGGING')),
    environment: tryGetEnv('NODE_ENV') as Environment,
    logLevel: tryGetEnv('LOG_LEVEL') as LogLevel,
}));
