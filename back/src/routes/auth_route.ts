import { z } from 'zod';
import { Context, httpErrors, Router, Status } from 'oak';

import * as authService from '/services/auth_service.ts';
import { TokenProperty } from '/types/auth_model.ts';
import { safeParseBody, validCaptchaToken } from '/utils/route_helper.ts';
import * as userService from '/services/user_service.ts';
import { getAuthRoute } from './routes.ts';
import userGuard from '/middlewares/userguard_middleware.ts';
import { UserRole } from '/types/user_model.ts';

const validAuthFormUser = z.object({
    email: z.string(),
    password: z.string(),
});

const validVerifyToken = z.object({
    token: z.string(),
});

const authRouter = new Router();

function getPathCookie(key: string): { path?: string } {
    return {
        path: key === 'refresh_token' ? `${getAuthRoute()}` : '/',
    };
}

function setCookie(ctx: Context, key: string, tokenProp: TokenProperty) {
    return ctx.cookies.set(key, tokenProp.value, {
        maxAge: tokenProp.maxAge,
        secure: false,
        sameSite: 'strict',
        httpOnly: true,
        ...getPathCookie(key),
    });
}

const login = async (ctx: Context) => {
    const body = await safeParseBody(ctx);
    await validCaptchaToken(body.captcha, ctx.request.ip);
    const loginUser = validAuthFormUser.parse(body);

    const token = await authService.loginUser(loginUser.email, loginUser.password);
    const user = await userService.getUserByEmail(loginUser.email);

    await Promise.all([setCookie(ctx, 'access_token', token.access_token), setCookie(ctx, 'refresh_token', token.refresh_token)]);

    ctx.response.body = {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
    };
};

const getSession = (ctx: Context) => {
    ctx.response.body = ctx.state.me;
};

const logout = async (ctx: Context) => {
    const tokens = await await Promise.all([ctx.cookies.get('access_token'), ctx.cookies.get('refresh_token')]);

    if (!tokens[0] || !tokens[1]) {
        throw new httpErrors.BadRequest('No tokens provided');
    }

    await Promise.all([ctx.cookies.delete('access_token'), ctx.cookies.delete('refresh_token')]);
    ctx.response.status = Status.NoContent;
};

const refreshToken = async (ctx: Context) => {
    const refresh_token = await ctx.cookies.get('refresh_token');
    if (!refresh_token) {
        throw new httpErrors.BadRequest('No refresh token provided');
    }

    const token = await authService.refreshToken(refresh_token);

    await Promise.all([setCookie(ctx, 'access_token', token.access_token), setCookie(ctx, 'refresh_token', token.refresh_token)]);
    ctx.response.status = Status.NoContent;
};

const verifyUser = async (ctx: Context) => {
    const body = await safeParseBody(ctx);
    await validCaptchaToken(body.captcha, ctx.request.ip);
    const verifyToken = validVerifyToken.parse(body);

    await authService.verifyUser(verifyToken.token);
    ctx.response.status = Status.NoContent;
};

authRouter.post('/login', login);
authRouter.get('/me', userGuard([UserRole.USER]), getSession);
authRouter.post('/logout', userGuard([UserRole.USER]), logout);
authRouter.post(`/refresh`, userGuard([UserRole.USER]), refreshToken);
authRouter.post('/verify', verifyUser);

export default authRouter;
