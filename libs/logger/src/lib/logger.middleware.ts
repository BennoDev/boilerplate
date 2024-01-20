import { Injectable, type NestMiddleware } from '@nestjs/common';
import { type NextFunction, type Request, type Response } from 'express';

import { Logger } from './logger.service';
import { type LogLevel } from './logger.types';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(private readonly logger: Logger) {
        this.logger.setContext('Request');
    }

    use(req: Request, res: Response, next: NextFunction): void {
        const startTime = Date.now();
        const message = `${req.method} ${req.originalUrl}`;

        res.on('finish', () => {
            const duration = Date.now() - startTime;

            // The log level is determined by the status code of the response.
            const logLevel: LogLevel =
                res.statusCode >= 500
                    ? 'error'
                    : res.statusCode >= 400
                      ? 'warn'
                      : 'info';

            this.logger[logLevel](message, {
                statusCode: res.statusCode,
                responseTime: `${duration}ms`,
                params: req.params,
                query: req.query,
                body: req.body,
                host: req.hostname,
            });
        });

        next();
    }
}
