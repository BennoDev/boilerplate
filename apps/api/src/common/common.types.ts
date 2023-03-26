import { type Request } from 'express';

import { type UserState } from '@libs/models';

/**
 * Deserialized user session for a request.
 */
export interface UserSession {
    userId: string;
    email: string;
    state: UserState;
    firstName: string;
    lastName: string;
}

export interface ApiRequest extends Request {
    user?: UserSession;
}
