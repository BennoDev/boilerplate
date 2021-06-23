/**
 * Tries to get an environment variable with the given name.
 * Throws an error if the variable was not found.
 *
 * @param envVarName Name of the environment variable to look for
 * @returns Value of the environment variable
 */
export function tryGetEnv(envVarName: string): string {
    const envVar = process.env[envVarName];
    if (envVar) {
        return envVar;
    }

    throw new Error(`Config variable ${envVarName} not found`);
}
