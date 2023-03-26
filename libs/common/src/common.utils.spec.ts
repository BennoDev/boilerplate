import { MissingEnvVar } from './common.errors';
import { allSettled, tryGetEnv } from './common.utils';

describe('common.utils', () => {
    describe('tryGetEnv', () => {
        afterAll(() => {
            delete process.env.TEST_VAR_1;
        });

        it('gets an env vars content', () => {
            process.env.TEST_VAR_1 = 'hey';

            const value = tryGetEnv('TEST_VAR_1');
            expect(value).toBe('hey');
        });

        it('throws when the env var isnt defined', () => {
            expect(() => tryGetEnv('TEST_VAR_NOT_FOUND')).toThrowError(
                MissingEnvVar,
            );
        });
    });

    describe('allSettled', () => {
        it('should properly group fulfilled and rejected', async () => {
            const { fulfilled, rejected } = await allSettled([
                Promise.resolve('A value'),
                Promise.reject(),
                Promise.resolve('A value'),
                Promise.reject(new Error('A reason')),
            ]);

            expect(fulfilled.length).toBe(2);
            expect(fulfilled[0].value).toBe('A value');
            expect(rejected.length).toBe(2);
            expect(rejected[1].reason).toEqual(new Error('A reason'));
        });
    });
});
