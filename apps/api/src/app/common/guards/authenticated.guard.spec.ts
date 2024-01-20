import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { type HttpArgumentsHost } from '@nestjs/common/interfaces';
import { mock, when, instance, reset } from '@typestrong/ts-mockito';

import { UserState } from '@libs/models';

import { AuthenticatedGuard } from './authenticated.guard';

describe('AuthenticationGuard', () => {
    const context = mock<ExecutionContext>();
    const argumentsHost = mock<HttpArgumentsHost>();

    const guard = new AuthenticatedGuard();

    afterEach(() => {
        reset(context);
        reset(argumentsHost);
    });

    it('should authenticate incoming requests', async () => {
        when(context.switchToHttp()).thenReturn(instance(argumentsHost));
        when(argumentsHost.getRequest()).thenReturn({
            isAuthenticated: () => true,
            user: {
                state: UserState.Active,
            },
        });

        const isAuthenticated = await guard.canActivate(instance(context));

        expect(isAuthenticated).toBe(true);
    });

    it('should destroy session and throw error when not authenticated', async () => {
        when(context.switchToHttp()).thenReturn(instance(argumentsHost));
        when(argumentsHost.getRequest()).thenReturn({
            isAuthenticated: () => false,
            logout: () => null,
            session: {
                destroy: (cb: (...args: any[]) => void): void => cb(),
            },
        });
        when(argumentsHost.getResponse()).thenReturn({
            clearCookie: (_cookieName: string) => null,
        });

        await expect(guard.canActivate(instance(context))).rejects.toThrow(
            UnauthorizedException,
        );
    });

    it('should destroy session and throw error when not in ACTIVE state', async () => {
        when(context.switchToHttp()).thenReturn(instance(argumentsHost));
        when(argumentsHost.getRequest()).thenReturn({
            isAuthenticated: () => false,
            logout: () => null,
            user: {
                state: UserState.Inactive,
            },
            session: {
                destroy: (cb: (...args: any[]) => void): void => cb(),
            },
        });
        when(argumentsHost.getResponse()).thenReturn({
            clearCookie: (_cookieName: string) => null,
        });

        await expect(guard.canActivate(instance(context))).rejects.toThrow(
            UnauthorizedException,
        );
    });
});
