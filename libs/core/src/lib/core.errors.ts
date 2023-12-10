export class MissingEnvVar extends Error {
    constructor(varName: string) {
        super(`Config variable ${varName} not found`);
    }
}
