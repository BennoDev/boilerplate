# Todo

- [x] Dockerfile
    - docker build -f './docker/Dockerfile' --build-arg APP_NAME=api --progress=plain -t boilerplate/api .
    - docker run --name api_boilerplate --network boilerplate_default --env-file './apps/api/.env.docker' -p '3001:3001' boilerplate/api
- [x] ModelsModule -> DatabaseModule + split models into libs
- [x] Remove Worker 2nd app
- [x] Add Code Snippets
- [x] Fix nest-c snippet config key
- [x] Fix Jest using different TS version FML
- [x] Fix pre commit hooks
- [x] Readme

# Future update

1. Getting Started Guide
2. Dependabot [x]
   2.1 Grouping [x]
3. Refactor Async Local Storage usage
    - Make it usable in a more generic way, instead of user session decorator for example.
    - Split up context store into different stores for different purposes, for the libs/logger a LoggerStore, and you would pass the underlying ALS store to the LoggerModule when instantiating it.
    - Add a user store for user session data that functions similarly to LoggerStore. An abstraction over the same, shared, ALS store.
4. Check NestJS-Pino again? [x]
    - Not doing this after 3rd attempt:
        - It's not possible to access the internal (ALS) store of the logger.
        - The request ID is absent in request logs.
        - The request logging itself is super verbose.
        - It doesn't play nicely with anything that isn't HTTP (SQS, Bull, WebSockets, ...)
        - 4th attempt I could:
            - disable request logging
            - pass mixin through to Logger Lib to decouple from ALS / CLS
5. Prisma
6. Validate Config
7. Overall guidelines
8. Deepsource code quality? [x]
    - Seems to work quite nicely, but maybe not appropriate for a boilerplate
9. E2E Tests
10. Distroless Docker
11. Auth Solution?
