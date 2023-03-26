import {
    Injectable,
    type NestInterceptor,
    type ExecutionContext,
    type CallHandler,
    HttpStatus,
    type HttpException,
} from '@nestjs/common';
import { type Response, type Request } from 'express';
import { type Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { Logger } from '@libs/logger';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    constructor(private readonly logger: Logger) {
        this.logger.setContext('Request');
    }

    intercept(
        executionContext: ExecutionContext,
        next: CallHandler<unknown>,
    ): Observable<unknown> {
        const req = executionContext.switchToHttp().getRequest<Request>();
        const formatLogMessage = `${req.method} ${req.originalUrl}`;
        const startTime = Date.now();
        return next.handle().pipe(
            tap(() => {
                this.logger.info(formatLogMessage, {
                    status: executionContext
                        .switchToHttp()
                        .getResponse<Response>().statusCode,
                    duration: `${this.calculateRequestDuration(startTime)}ms`,
                    params: req.params,
                    query: req.query,
                    body: req.body,
                    host: req.hostname,
                });
            }),
            catchError((error: HttpException) => {
                const errorResponse = error.getResponse() as {
                    statusCode?: number;
                    error?: string;
                    message?: string;
                };

                this.logger.warn(formatLogMessage, {
                    status:
                        errorResponse.statusCode ??
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    code: errorResponse.error ?? 'Unknown error',
                    description: errorResponse.message ?? 'No description',
                    duration: `${this.calculateRequestDuration(startTime)}ms`,
                    params: req.params,
                    query: req.query,
                    body: req.body,
                    host: req.hostname,
                });

                return throwError(() => error);
            }),
        );
    }

    /**
     * Calculates the amount of time it took to handle a request.
     *
     * @param startTime UNIX timestamp of when the request came in.
     */
    private calculateRequestDuration(startTime: number): number {
        return Date.now() - startTime;
    }
}
