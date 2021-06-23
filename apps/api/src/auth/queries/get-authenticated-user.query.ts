import { Injectable } from '@nestjs/common';

import { UserRepository } from '@libs/models';
import { IHandler } from '@libs/common';

import { AuthenticatedUserResponse } from '../dto';
import { UnexpectedNull } from '../../common/common.errors';

export type GetAuthenticatedUserQuery = {
    data: { userId: string };
};

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
