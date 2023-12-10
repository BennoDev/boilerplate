import { registerAs } from '@nestjs/config';

import { type Environment, tryGetEnv } from '@libs/core';

import { type LogLevel } from './logger.types';

export type LoggerConfig = {
    readonly environment: Environment;
    readonly logLevel: LogLevel;
    /**
     * Separate LogLevel for database logs. Database debug logs take up a lot of space in the overall logs
     * and tend to drown application logs, so this property is to be able to configure them separately.
     *
     * This log level can only be higher or equal to the main logLevel property, otherwise it will have no affect - as the main logLevel is always respected.
     */
    readonly databaseLogLevel: LogLevel;
    /**
     * Enable middleware that will log all incoming requests and responses.
     * Also creates a request context with a trace id that will automatically be added to all logs within the same request.
     */
    readonly enableRequestLogging: boolean;
};

export const loggerConfig = registerAs<LoggerConfig>('logger', () => ({
    databaseLogLevel: tryGetEnv('DATABASE_LOG_LEVEL') as LogLevel,
    enableRequestLogging: Boolean(tryGetEnv('ENABLE_REQUEST_LOGGING')),
    environment: tryGetEnv('NODE_ENV') as Environment,
    logLevel: tryGetEnv('LOG_LEVEL') as LogLevel,
}));
