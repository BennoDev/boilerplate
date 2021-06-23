import { NestMiddleware, Inject, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { Namespace } from 'cls-hooked';

import {
    namespaceToken,
    traceIdKey,
    traceIdHeaderName,
} from './logger.constants';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
    constructor(
        @Inject(namespaceToken)
        private readonly namespace: Namespace,
    ) {}

    use(req: Request, _: Response, next: () => void): void {
        const traceId = req.headers[traceIdHeaderName];
        this.namespace.run(() => {
            this.namespace.set(traceIdKey, traceId || uuid());
            next();
        });
    }
}
