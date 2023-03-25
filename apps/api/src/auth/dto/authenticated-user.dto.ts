import { type UserState } from '@libs/models';

import { BaseEntityResponse } from '../../common/dto';

export class AuthenticatedUserResponse extends BaseEntityResponse {
    readonly email!: string;
    readonly state!: UserState;
    readonly firstName?: string;
    readonly lastName?: string;
}
