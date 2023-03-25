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
