import { Injectable } from '@nestjs/common';

import { type IHandler } from '@libs/common';
import { UserRepository } from '@libs/models';

import { UnexpectedNull } from '../../common';
import { type AuthenticatedUserResponse } from '../dto';

export interface GetAuthenticatedUserQuery {
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
        const user = await this.userRepository
            .createQueryBuilder('u')
            .select([
                'u.id',
                'u.createdAt',
                'u.updatedAt',
                'u.email',
                'u.state',
                'u.firstName',
                'u.lastName',
            ])
            .where({ id: data.userId })
            .getSingleResult();
        if (!user) throw new UnexpectedNull();
        return user;
    }
}
