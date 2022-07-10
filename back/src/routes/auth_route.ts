import { zod, oak } from '../../deps.ts';
import config from '../config.ts';
import { getAuthRoute } from './routes.ts';
import * as authService from '../services/auth_service.ts';
import * as userService from '../services/user_service.ts';
import userGuard from '../middlewares/userguard_middleware.ts';
import { UserRole } from '../types/user_model.ts';
import { TokenProperty } from '../types/auth_model.ts';
import { safeParseBody } from '../utils/route_helper.ts';

const validAuthFormUser = zod.object({
    email: zod.string(),
    password: zod.string(),
});

const authRouter = new oak.Router();

function getPathCookie(key: string): { path?: string } {
    return {
        path: key === 'refresh_token' ? `${getAuthRoute()}` : '/',
    };
}

function setCookie(ctx: oak.Context, key: string, tokenProp: TokenProperty) {
    return ctx.cookies.set(key, tokenProp.value, {
        maxAge: tokenProp.maxAge,
        secure: config.ENV !== 'dev',
        sameSite: 'strict',
        httpOnly: true,
        ...getPathCookie(key),
    });
}

const login = async (ctx: oak.Context) => {
    const body = await safeParseBody(ctx);
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

const getSession = (ctx: oak.Context) => {
    ctx.response.body = ctx.state.me;
};

const logout = async (ctx: oak.Context) => {
    const tokens = await await Promise.all([ctx.cookies.get('access_token'), ctx.cookies.get('refresh_token')]);

    if (!tokens[0] || !tokens[1]) {
        throw new oak.httpErrors.BadRequest('No tokens provided');
    }

    await Promise.all([ctx.cookies.delete('access_token'), ctx.cookies.delete('refresh_token')]);

    ctx.response.status = 204;
};

const refreshToken = async (ctx: oak.Context) => {
    const refresh_token = await ctx.cookies.get('refresh_token');
    if (!refresh_token) {
        throw new oak.httpErrors.BadRequest('No refresh token provided');
    }

    const token = await authService.refreshToken(refresh_token);

    await Promise.all([setCookie(ctx, 'access_token', token.access_token), setCookie(ctx, 'refresh_token', token.refresh_token)]);

    ctx.response.status = 204;
};

authRouter.post('/login', login);
authRouter.get('/me', userGuard([UserRole.USER]), getSession);
authRouter.post('/logout', logout);
authRouter.post(`/refresh`, refreshToken);

export default authRouter;
