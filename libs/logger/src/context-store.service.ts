import { AsyncLocalStorage } from 'node:async_hooks';

import { Injectable } from '@nestjs/common';

import { NoContextFound } from './logger.errors';

/**
 * Represents the continuous context for a given HTTP request,
 * or a given job being processed by a queue, etc...
 */
export type Context = {
    traceId: string;
};

@Injectable()
export class ContextStore {
    constructor(private readonly storage: AsyncLocalStorage<Context>) {}

    /**
     * Gets the data for the currently active context.
     * If no context is active an error will be thrown.
     *
     * @throws {@link NoContextFound}
     */
    getContext(): Context {
        const context = this.storage.getStore();
        if (!context) {
            throw new NoContextFound();
        }

        return context;
    }

    /**
     * Gets the data for the currently active context.
     * If no context is active, it will return an empty object.
     */
    getContextOrDefault(): Context | Record<string, never> {
        return this.storage.getStore() ?? {};
    }
}
