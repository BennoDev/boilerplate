import { NestFactory } from '@nestjs/core';
import {
    INestApplication,
    ValidationPipe,
    BadRequestException,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import rateLimit from 'express-rate-limit';
import redisRateLimitStore from 'rate-limit-redis';
import basicAuth from 'express-basic-auth';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import IORedis from 'ioredis';

import { Environment, tryGetEnv } from '@libs/common';
import { Logger, NestLoggerProxy } from '@libs/logger';

import { ApiModule } from './api.module';
import { apiConfig, ApiConfig } from './api.config';

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
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const fullSwaggerPath = `${API_PREFIX}/${config.swagger.path!}`;
    const isLocalEnvironment = [Environment.Local, Environment.Test].includes(
        config.environment,
    );

    if (!isLocalEnvironment) {
        app.use(
            `/${fullSwaggerPath}`,
            basicAuth({
                challenge: true,
                users: {
                    [config.swagger.username!]: config.swagger.password!,
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
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
}

function addGlobalMiddleware(
    app: INestApplication,
    logger: Logger,
    config: ApiConfig,
): void {
    logger.info('Initializing global middleware', { context });

    // Due to a bug in the ioredis typings we have to use our own extended type.
    const client = getRedisClient(config) as IORedis;

    app.enableCors({
        origin: config.api.allowedOrigins,
        methods: ['OPTIONS', 'HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    });

    app.use(
        rateLimit({
            max: config.api.rateLimit,
            store: new redisRateLimitStore({
                sendCommand: (...args: []) => client.call(...args),
            }),
        }),
    );
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

    client.on('error', logger.error);
}

// Don't directly access, only access via `getRedisClient`
let redisClient: IORedis.Redis | null = null;

function getRedisClient(config: ApiConfig): IORedis.Redis {
    if (!redisClient) {
        redisClient = new IORedis({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password,
        });
    }

    return redisClient;
}

bootstrap();

type IORedis = IORedis.Redis & {
    call: (...args: string[]) => Promise<number | string | Array<number | string>>;
};
