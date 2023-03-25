import { type LogLevel } from './logger.types';

/**
 * Key for incoming request's trace id header.
 */
export const traceIdHeaderName = 'x-request-id';

/**
 * Mapping of the LogLevel type, to a number indicating the level's priority.
 */
export const logLevelNumeric: Record<LogLevel, number> = {
    silent: 0,
    trace: 1,
    debug: 2,
    info: 3,
    warn: 4,
    error: 5,
    fatal: 6,
};
