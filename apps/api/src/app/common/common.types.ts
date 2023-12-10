import { type UUID } from 'node:crypto';

import { type Request } from 'express';

import { type UserState } from '@libs/models';

/**
 * Deserialized user session for a request.
 */
export type UserSession = {
    userId: UUID;
    email: string;
    state: UserState;
    firstName: string;
    lastName: string;
};

export type ApiRequest = {
    user?: UserSession;
} & Request;
