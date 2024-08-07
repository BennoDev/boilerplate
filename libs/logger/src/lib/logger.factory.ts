import { Inject, Injectable } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import pino from 'pino';

import { Environment } from '@libs/core';

import { ContextStore } from './context-store.service';
import { loggerConfig, type LoggerConfig } from './logger.config';
import { Logger } from './logger.service';

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

@Injectable()
export class LoggerFactory {
    private readonly parentLogger: pino.Logger;

    constructor(
        @Inject(loggerConfig.KEY)
        private readonly config: LoggerConfig,
        @Inject(INQUIRER)
        private readonly inquirer: object,
        private readonly store: ContextStore,
    ) {
        this.parentLogger = this.createParentLogger();
    }

    private createParentLogger(): pino.Logger {
        const isLocalEnvironment = [
            Environment.Local,
            Environment.Test,
        ].includes(this.config.environment);

        return pino({
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
     * Returns information that should be added to every single log message.
     * These are generally supportive fields such as trace ids, or environment information.
     */
    private metaMixin(): Record<string, unknown> {
        return { traceId: this.store.getContextOrDefault().traceId };
    }

    getLogger(): Logger {
        return new Logger(
            this.parentLogger.child({
                environment: this.config.environment.toUpperCase(),
                context: this.inquirer?.constructor?.name,
            }),
        );
    }
}
