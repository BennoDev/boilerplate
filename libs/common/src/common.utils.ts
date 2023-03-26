import { MissingEnvVar } from './common.errors';

/**
 * Tries to get an environment variable with the given name.
 * Throws an error if the variable was not found.
 *
 * @param varName Name of the environment variable to look for
 */
export const tryGetEnv = (varName: string): string => {
    const envVar = process.env[varName];
    if (envVar) {
        return envVar;
    }

    throw new MissingEnvVar(varName);
};

/**
 * Awaits an array of promises and groups them by fulfilled and rejected.
 *
 * @param promises List of promise that will be awaited
 */
export const allSettled = async <Result = unknown>(
    promises: Promise<Result>[],
): Promise<{
    fulfilled: PromiseFulfilledResult<Result>[];
    rejected: PromiseRejectedResult[];
}> => {
    const results = await Promise.allSettled(promises);

    const fulfilled: PromiseFulfilledResult<Result>[] = [];
    const rejected: PromiseRejectedResult[] = [];
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            fulfilled.push(result);
        } else {
            rejected.push(result);
        }
    });

    return { fulfilled, rejected };
};
