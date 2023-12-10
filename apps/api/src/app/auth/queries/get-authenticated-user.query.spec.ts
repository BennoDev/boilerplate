import { Test, type TestingModule } from '@nestjs/testing';

import { ModelsModule } from '@libs/models';

import { GetAuthenticatedUserHandler } from './get-authenticated-user.query';

describe('GetAuthenticatedUserHandler', () => {
    let module: TestingModule;
    let handler: GetAuthenticatedUserHandler;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [ModelsModule.registerTest()],
            providers: [GetAuthenticatedUserHandler],
        }).compile();

        handler = module.get(GetAuthenticatedUserHandler);
    });

    afterAll(async () => {
        await module.close();
    });

    describe('execute', () => {
        it('should return the correct user', async () => {
            const userId = 'c4cb4582-1e97-4e3e-9d49-c744c8c1a229';
            const result = await handler.execute({ data: { userId } });
            expect(result).toMatchSnapshot();
        });
    });
});
