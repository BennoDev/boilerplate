import { NestMiddleware, Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import { Context } from './context-store.service';
import { traceIdHeaderName } from './logger.constants';

/**
 * Sets up a context with a trace id for the each HTTP request.
 */
@Injectable()
export class ContextStoreMiddleware implements NestMiddleware {
    constructor(private readonly storage: AsyncLocalStorage<Context>) {}

    use(req: Request, _: Response, next: () => void): void {
        const traceId = req.header(traceIdHeaderName) ?? uuid();
        this.storage.run({ traceId }, () => {
            next();
        });
    }
}
