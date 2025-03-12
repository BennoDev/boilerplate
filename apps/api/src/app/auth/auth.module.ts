import { BullModule } from '@nestjs/bullmq';
import {
    Module,
    type MiddlewareConsumer,
    type NestModule,
} from '@nestjs/common';
import { api } from '@opentelemetry/sdk-node';

import { CommonModule } from '../common';

import { meterInjectionToken } from './auth.constants';
import { AuthController } from './auth.controller';
import { LoginHandler, ChangePasswordHandler } from './commands';
import { SessionSerializer } from './middleware';
import { GetAuthenticatedUserHandler } from './queries';
import { HashService, MetricsService } from './services';

@Module({
    imports: [CommonModule, BullModule.registerQueue({ name: 'worker' })],
    controllers: [AuthController],
    providers: [
        SessionSerializer,
        HashService,
        LoginHandler,
        ChangePasswordHandler,
        GetAuthenticatedUserHandler,
        MetricsService,
        {
            provide: meterInjectionToken,
            useValue: api.metrics.getMeterProvider().getMeter('auth'),
        },
    ],
})
export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(SessionSerializer).forRoutes('*');
    }
}
