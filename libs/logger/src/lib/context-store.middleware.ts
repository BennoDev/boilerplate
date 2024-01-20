import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

import { type NestMiddleware, Injectable } from '@nestjs/common';
import { type Request, type Response } from 'express';

import { type Context } from './context-store.service';
import { traceIdHeaderName } from './logger.constants';

/**
 * Sets up a context with a trace id for the each HTTP request.
 */
@Injectable()
export class ContextStoreMiddleware implements NestMiddleware {
    constructor(private readonly storage: AsyncLocalStorage<Context>) {}

    use(req: Request, _: Response, next: () => void): void {
        const traceId = req.header(traceIdHeaderName) ?? randomUUID();
        this.storage.run({ traceId }, () => {
            next();
        });
    }
}
