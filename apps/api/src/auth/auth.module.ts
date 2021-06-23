import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { CommonModule } from '../common/common.module';
import { SessionSerializer } from './middleware';
import { LoginHandler, ChangePasswordHandler } from './commands';
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
