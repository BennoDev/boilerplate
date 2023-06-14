import { Injectable } from '@nestjs/common';

import { type IHandler } from '@libs/common';
import { UserRepository } from '@libs/models';

import { UnexpectedNull } from '../../common';
import { type AuthenticatedUserResponse } from '../dto';

export type GetAuthenticatedUserQuery = {
    data: { userId: string };
}

@Injectable()
export class GetAuthenticatedUserHandler
    implements IHandler<GetAuthenticatedUserQuery>
{
    constructor(private readonly userRepository: UserRepository) {}

    async execute({
        data,
    }: GetAuthenticatedUserQuery): Promise<AuthenticatedUserResponse> {
        const user = await this.userRepository.findOne(data.userId);

        if (!user) throw new UnexpectedNull();

        return {
            id: user.id,
            email: user.email,
            state: user.state,
            firstName: user.firstName,
            lastName: user.lastName,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
