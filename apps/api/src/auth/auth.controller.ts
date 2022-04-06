import {
    Controller,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Get,
    Req,
    Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';

import { UserSession } from '../common/common.types';
import { GetUserSession } from '../common/decorators';
import { AuthenticatedGuard, destroyExpressSession } from '../common/guards';

import { ChangePasswordHandler, LoginHandler } from './commands';
import {
    LoginRequest,
    ChangePasswordRequest,
    AuthenticatedUserResponse,
} from './dto';
import { GetAuthenticatedUserHandler } from './queries';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly loginHandler: LoginHandler,
        private readonly changePasswordHandler: ChangePasswordHandler,
        private readonly getAuthenticatedUserHandler: GetAuthenticatedUserHandler,
    ) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() body: LoginRequest,
        @Req() request: Request & { session: { userId: string } },
    ): Promise<AuthenticatedUserResponse> {
        const user = await this.loginHandler.execute({ data: body });

        // Add authenticated user's id to session cookie
        request.session.userId = user.id;

        return this.getAuthenticatedUserHandler.execute({
            data: { userId: user.id },
        });
    }

    @ApiBearerAuth()
    @UseGuards(AuthenticatedGuard)
    @Get('me')
    authenticate(
        @GetUserSession() session: UserSession,
    ): Promise<AuthenticatedUserResponse> {
        return this.getAuthenticatedUserHandler.execute({
            data: { userId: session.userId },
        });
    }

    @ApiBearerAuth()
    @UseGuards(AuthenticatedGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('logout')
    async logout(
        @Req() request: Request,
        @Res() response: Response,
    ): Promise<void> {
        await destroyExpressSession(request, response);
        response.send();
    }

    @Post('change-password')
    async changePassword(
        @Body() body: ChangePasswordRequest,
        @GetUserSession() session: UserSession,
    ): Promise<void> {
        await this.changePasswordHandler.execute({ data: body, session });
    }
}
