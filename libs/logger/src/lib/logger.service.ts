import { type pino } from 'pino';

type LogMeta = Record<string, unknown> & {
    /**
     * Don't set this property directly in the log meta, it can cause duplicates if it's already set through the inquirer or {@link Logger.setBindings}.
     */
    context?: never;
    /**
     * Id for the request or operation this log belongs to.
     * If none is passed, it will default to the idea found in the active namespace (if one is active).
     */
    traceId?: string;
    /**
     * Internally used by pino as the main message key in the JSON log - don't use it as it will be ignored.
     */
    message?: never;
    /**
     * Internally used by pino to log the current timestamp, overwriting may cause date formatting exceptions.
     */
    time?: never;
};

export class Logger {
    constructor(private readonly logger: pino.Logger) {}

    /**
     * @see {@link pino.Logger.setBindings}
     */
    setBindings = this.logger.setBindings.bind(this.logger);

    /**
     * Use this level to log serious errors that are unexpected.
     *
     * For example:
     * Connection lost to a database or a redis instance.
     *
     * @param message Message for this log
     * @param meta Extra useful information for this log
     */
    error(message: string, meta: LogMeta = {}): void {
        this.logger.error(meta, message);
    }

    /**
     * Use this level to log errors / unexpected behaviour that **we can handle**.
     *
     * For example:
     * - Most business exceptions (for example user not found, or user doesnt have access to operation / resource).
     * - External API is not responding.
     * - Database query errors / slow queries.
     *
     * @param message Message for this log
     * @param meta Extra useful information for this log
     */
    warn(message: string, meta: LogMeta = {}): void {
        this.logger.warn(meta, message);
    }

    /**
     * Use this level to log general information that is always relevant.
     * These logs most likely will be visible on any environment, including production.
     *
     * For example:
     * - General application startup information
     * - HTTP request logging
     *
     * @param message Message for this log
     * @param meta Extra useful information for this log
     */
    info(message: string, meta: LogMeta = {}): void {
        this.logger.info(meta, message);
    }

    /**
     * Use this level of logging for information useful during development.
     * Typically these logs will be visible on local, testing or remote development environments.
     *
     * For example:
     * - Logs that expose useful information to follow the flows of business logic during development, and to serve as an aid to pinpoint where the application breaks.
     * - Database query logs (succesful queries).
     *
     * @param message Message for this log
     * @param meta Extra useful information for this log
     */
    debug(message: string, meta: LogMeta = {}): void {
        this.logger.debug(meta, message);
    }
}
