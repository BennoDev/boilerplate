import {
    type INestApplication,
    ValidationPipe,
    BadRequestException,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import * as connectRedis from 'connect-redis';
import basicAuth from 'express-basic-auth';
import * as session from 'express-session';
import helmet from 'helmet';

import { Environment, tryGetEnv } from '@libs/common';
import { Logger, NestLoggerProxy } from '@libs/logger';

import { apiConfig, type ApiConfig } from './api.config';
import { ApiModule } from './api.module';
import { getRedisClient } from './redis.client';

const isProductionLikeEnvironment = [
    Environment.Production,
    Environment.Staging,
].includes(tryGetEnv('NODE_ENV') as Environment);

const context = 'Bootstrap:Api';
const API_PREFIX = 'api';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(ApiModule, { bufferLogs: true });
    const logger = app.get(Logger);
    app.useLogger(new NestLoggerProxy(logger));

    logger.info('Successfully created nest app', { context });

    app.setGlobalPrefix(API_PREFIX);
    const config = app.get<ApiConfig>(apiConfig.KEY);

    if (!isProductionLikeEnvironment) {
        addSwaggerDocs(app, logger, config);
    }

    addGlobalMiddleware(app, logger, config);
    addSessionMiddleware(app, logger, config);

    await app.listen(config.api.port);
    logger.info('App running', { context, port: config.api.port });
}

function addSwaggerDocs(
    app: INestApplication,
    logger: Logger,
    config: ApiConfig,
): void {
    logger.info('Initializing Swagger...', { context });

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
        .setVersion('1.0')
        .addCookieAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(fullSwaggerPath, app, document);

    logger.info('Swagger running', { context, path: fullSwaggerPath });
}

function addGlobalMiddleware(
    app: INestApplication,
    logger: Logger,
    config: ApiConfig,
): void {
    logger.info('Initializing global middleware', { context });

    app.enableCors({
        origin: config.api.allowedOrigins,
        methods: ['OPTIONS', 'HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    });

    app.use(helmet());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            exceptionFactory: (errors): BadRequestException =>
                new BadRequestException(
                    errors.map(error => ({
                        children: error.children,
                        constraints: error.constraints,
                        property: error.property,
                    })),
                ),
        }),
    );
    app.use(compression());
}

function addSessionMiddleware(
    app: INestApplication,
    logger: Logger,
    config: ApiConfig,
) {
    const RedisStore = connectRedis(session);
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
            store: new RedisStore({ client }),
        }),
    );

    client.on('error', (error: Error) =>
        logger.error('Redis error occurred', { context: 'Redis', error }),
    );
}

bootstrap();
