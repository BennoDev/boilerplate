/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NestFactory } from '@nestjs/core';
import {
    INestApplication,
    ValidationPipe,
    BadRequestException,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as rateLimit from 'express-rate-limit';
import * as redisStore from 'rate-limit-redis';
import throng from 'throng';
import * as basicAuth from 'express-basic-auth';
import * as session from 'express-session';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';

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
        logger.info('Initializing swagger', { context });
        addSwaggerDocs(app, logger, config);
    }

    logger.info('Initializing middleware', { context });
    addGlobalMiddleware(app, config);
    addSessionMiddleware(app, logger, config);

    await app.listen(config.api.port);
    logger.info(`App running on port [${config.api.port}]`, { context });
}

function addSwaggerDocs(
    app: INestApplication,
    logger: Logger,
    config: ApiConfig,
): void {
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

    logger.info(`Swagger running at [${fullSwaggerPath}]`, { context });
}

function addGlobalMiddleware(app: INestApplication, config: ApiConfig): void {
    app.enableCors({
        origin: config.api.allowedOrigins,
        methods: ['OPTIONS', 'HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    });
    app.use(
        rateLimit({
            max: config.api.rateLimit,
            store: new redisStore({ redisURL: config.redisUrl }),
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
    // Have to mark client as any because of an error in the typings of redis | connect-redis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client: any = redis.createClient({ url: config.redisUrl });

    app.use(
        session({
            secret: config.session.secret,
            resave: true,
            saveUninitialized: false,
            cookie: {
                maxAge: config.session.expiresIn,
                secure: 'auto',
                httpOnly: true,
            },
            store: new RedisStore({ client }),
        }),
    );

    client.on('error', logger.error);
}

function run(): void {
    if (isProductionLikeEnvironment) {
        throng({
            workers: process.env.WORKERS || 1,
            start: bootstrap,
            lifetime: Infinity,
        });
    } else {
        bootstrap();
    }
}

run();
