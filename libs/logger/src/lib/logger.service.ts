import { Injectable, Inject, Scope } from '@nestjs/common';
import pino from 'pino';

import { Environment } from '@libs/core';

import { ContextStore } from './context-store.service';
import { LoggerConfig, loggerConfig } from './logger.config';

type LogMeta = Record<string, unknown> & {
    /**
     * Added as a label to the message, easy to search by.
     * Ideally this would be set logger-instance level by calling {@link setContext} in the constructor of the consuming class.
     * It can be overwritten here at individual log-level if necessary.
     */
    context?: string;
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

/**
 * Redacting these because they are in modern times (cloud native / container based) mostly redundant information.
 */
const basePropsToRedact = ['pid', 'hostname'];

/**
 * Common knowns tokens / secrets, add anything that is sensitive to this list.
 * NOTE: In local environments these will not be redacted.
 */
const secretsToRedact = [
    '*.password',
    '*.newPassword',
    '*.oldPassword',
    '*.accessToken',
    '*.refreshToken',
];

@Injectable({ scope: Scope.TRANSIENT })
export class Logger {
    private readonly logger: pino.Logger;
    private readonly formattedEnvironment: string;
    private context = 'MISSING_CONTEXT';

    constructor(
        @Inject(loggerConfig.KEY)
        private readonly config: LoggerConfig,
        private readonly contextStore: ContextStore,
    ) {
        this.formattedEnvironment = this.config.environment.toUpperCase();

        const isLocalEnvironment = [
            Environment.Local,
            Environment.Test,
        ].includes(this.config.environment);

        this.logger = pino({
            redact: {
                remove: true,
                paths: isLocalEnvironment
                    ? basePropsToRedact
                    : [...basePropsToRedact, ...secretsToRedact],
            },
            transport: isLocalEnvironment
                ? {
                      target: 'pino-pretty',
                      options: {
                          translateTime: 'yyyy-mm-dd HH:MM:ss',
                          messageFormat: '[{context}]: {message}',
                          messageKey: 'message',
                      },
                  }
                : undefined,
            level: this.config.logLevel,
            messageKey: 'message',
            mixin: this.metaMixin.bind(this),
            formatters: {
                // This will include the level in string rather than in number in each log.
                level(level: string) {
                    return { level };
                },
            },
            serializers: {
                error: pino.stdSerializers.err,
                err: pino.stdSerializers.err,
                failureReasons: (errors: Error[]) =>
                    errors.map(pino.stdSerializers.err),
            },
        });
    }

    /**
     * Sets a shared context for all messages called for this logger instance.
     * Can be overwritten on a per-log basis by passing ´context´ as part of the log ´meta´.
     * Defaults to the name of the inquirer (the class that injected this logger instance).
     * @param context The context for the current Logger instance
     */
    setContext(context: string): void {
        this.context = context;
    }

    /**
     * Most urgent level of logging, use this in case something absolutely critical happens that
     * basically means the entire platform / application **can not function and can not automatically recover**.
     *
     * @param message Message for this log
     * @param meta Extra useful information for this log
     */
    fatal(message: string, meta: LogMeta = {}): void {
        this.logger.fatal(meta, message);
    }

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

    /**
     * Lowest level of logging, only for absolute details. In most cases, prefer `debug`.
     *
     * @param message Message for this log
     * @param meta Extra useful information for this log²²
     */
    trace(message: string, meta: LogMeta = {}): void {
        this.logger.trace(meta, message);
    }

    /**
     * Returns information that should be added to every single log message.
     * These are generally supportive fields such as trace ids, or environment information.
     */
    private metaMixin(): {
        context: string;
        environment: string;
        traceId?: string;
    } {
        return {
            context: this.context,
            environment: this.formattedEnvironment,
            traceId: this.contextStore.getContextOrDefault().traceId,
        };
    }
}
