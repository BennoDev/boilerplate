import {
    Module,
    type MiddlewareConsumer,
    type NestModule,
} from '@nestjs/common';

import { CommonModule } from '../common/common.module';

import { AuthController } from './auth.controller';
import { LoginHandler, ChangePasswordHandler } from './commands';
import { SessionSerializer } from './middleware';
import { GetAuthenticatedUserHandler } from './queries';
import { HashService } from './services';

@Module({
    imports: [CommonModule],
    controllers: [AuthController],
    providers: [
        SessionSerializer,
        HashService,
        LoginHandler,
        ChangePasswordHandler,
        GetAuthenticatedUserHandler,
    ],
})
export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(SessionSerializer).forRoutes('*');
    }
}
