export type IHandler<UseCase> = {
    execute(arg: UseCase): unknown;
};
