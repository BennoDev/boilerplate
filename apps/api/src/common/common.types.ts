import { UserState } from '@libs/models';

/**
 * Deserialized user session for a request.
 */
export type UserSession = {
    userId: string;
    email: string;
    state: UserState;
    firstName: string;
    lastName: string;
};
