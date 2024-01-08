import { type UUID } from 'node:crypto';

import { type Request } from 'express';
import { type Session } from 'express-session';

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
    // Declaration merging doesn't seem to work for (TS-)Jest so we are manually adding the session property here.
    session: Session;
} & Request;
