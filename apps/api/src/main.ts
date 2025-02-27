import { type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { RedisStore } from 'connect-redis';
import basicAuth from 'express-basic-auth';
import session from 'express-session';
import helmet from 'helmet';
import { patchNestJsSwagger } from 'nestjs-zod';

import { Environment, tryGetEnv } from '@libs/core';
import { Logger, NestLoggerProxy } from '@libs/logger';

import { apiConfig, type ApiConfig } from './app/api.config';
import { ApiModule } from './app/api.module';
import { getRedisClient } from './app/redis.client';

const isProductionLikeEnvironment = [
    Environment.Production,
    Environment.Staging,
].includes(tryGetEnv('NODE_ENV') as Environment);

const API_PREFIX = 'api';

const bootstrap = async (): Promise<void> => {
    const app = await NestFactory.create(ApiModule, {
        bufferLogs: true,
        autoFlushLogs: true,
        forceCloseConnections: true,
    });

    const logger = await app.resolve(Logger);
    logger.setContext('Bootstrap:Api');

    app.useLogger(new NestLoggerProxy(await app.resolve(Logger)));

    logger.info('Successfully created nest app');

    app.setGlobalPrefix(API_PREFIX);
    const config = app.get<ApiConfig>(apiConfig.KEY);

    if (!isProductionLikeEnvironment) {
        addSwaggerDocs(app, logger, config);
    }

    addGlobalMiddleware(app, logger, config);
    addSessionMiddleware(app, config);

    app.enableShutdownHooks();

    await app.listen(config.api.port);
    logger.info('App running', { port: config.api.port });
};

const addSwaggerDocs = (
    app: INestApplication,
    logger: Logger,
    config: ApiConfig,
): void => {
    logger.info('Initializing Swagger...');

    patchNestJsSwagger();

    /*
     * We cast here to circumvent having to deal with these values being possibly undefined.
     * If they are truly undefined this will be very easily notice by trying to access the docs.
     * This is a case where the extra effort for type safety is not worth it.
     */
    const { path, username, password } = config.swagger as {
        path: string;
        username: string;
        password: string;
    };

    const fullSwaggerPath = `${API_PREFIX}/${path}`;
    const isLocalEnvironment = [Environment.Local, Environment.Test].includes(
        config.environment,
    );

    if (!isLocalEnvironment) {
        app.use(
            `/${fullSwaggerPath}`,
            basicAuth({
                challenge: true,
                users: {
                    [username]: password,
                },
            }),
        );
    }

    const options = new DocumentBuilder()
        .setTitle(config.projectName)
        .setDescription('Swagger documentation')
        .addCookieAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(fullSwaggerPath, app, document);

    logger.info('Swagger running', { path: fullSwaggerPath });
};

const addGlobalMiddleware = (
    app: INestApplication,
    logger: Logger,
    config: ApiConfig,
): void => {
    logger.info('Initializing global middleware');

    app.enableCors({
        origin: config.api.allowedOrigins,
        methods: ['OPTIONS', 'HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    });

    app.use(helmet());
    app.use(compression());
};

const addSessionMiddleware = async (
    app: INestApplication,
    config: ApiConfig,
): Promise<void> => {
    const client = getRedisClient(config);

    app.use(
        session({
            secret: config.session.secret,
            resave: true,
            saveUninitialized: false,
            cookie: {
                maxAge: config.session.expiresIn,
                secure: 'auto',
                httpOnly: true,
                sameSite: true,
            },
            store: new RedisStore({ client, prefix: `${config.projectName}:` }),
        }),
    );

    const logger = await app.resolve(Logger);
    logger.setContext('Redis');
    client.on('error', (error: Error) =>
        logger.error('Redis error occurred', { error }),
    );
};

bootstrap();
