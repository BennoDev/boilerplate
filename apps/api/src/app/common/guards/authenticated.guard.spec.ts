import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { type HttpArgumentsHost } from '@nestjs/common/interfaces';
import { mock, mockReset } from 'jest-mock-extended';

import { UserState } from '@libs/models';

import { AuthenticatedGuard } from './authenticated.guard';

describe('AuthenticationGuard', () => {
    const context = mock<ExecutionContext>();
    const argumentsHost = mock<HttpArgumentsHost>();

    const guard = new AuthenticatedGuard();

    afterEach(() => {
        mockReset(context);
        mockReset(argumentsHost);
    });

    it('should authenticate incoming requests', async () => {
        context.switchToHttp.mockReturnValue(argumentsHost);
        argumentsHost.getRequest.mockReturnValue({
            isAuthenticated: () => true,
            user: {
                state: UserState.Active,
            },
        });

        const isAuthenticated = await guard.canActivate(context);

        expect(isAuthenticated).toBe(true);
    });

    it('should destroy session and throw error when not authenticated', async () => {
        context.switchToHttp.mockReturnValue(argumentsHost);
        argumentsHost.getRequest.mockReturnValue({
            isAuthenticated: () => false,
            logout: () => null,
            session: {
                destroy: (cb: (...args: any[]) => void): void => cb(),
            },
        });
        argumentsHost.getResponse.mockReturnValue({
            clearCookie: (_cookieName: string) => null,
        });

        await expect(guard.canActivate(context)).rejects.toThrow(
            UnauthorizedException,
        );
    });

    it('should destroy session and throw error when not in ACTIVE state', async () => {
        context.switchToHttp.mockReturnValue(argumentsHost);
        argumentsHost.getRequest.mockReturnValue({
            isAuthenticated: () => false,
            logout: () => null,
            user: {
                state: UserState.Inactive,
            },
            session: {
                destroy: (cb: (...args: any[]) => void): void => cb(),
            },
        });
        argumentsHost.getResponse.mockReturnValue({
            clearCookie: (_cookieName: string) => null,
        });

        await expect(guard.canActivate(context)).rejects.toThrow(
            UnauthorizedException,
        );
    });
});
