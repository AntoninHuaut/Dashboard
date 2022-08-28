import { Context, httpErrors, Middleware } from 'oak';

import { ContextUser, User } from '/types/user_model.ts';
import { getUserIdByToken } from '/services/app/trackmail_service.ts';
import { getUserById } from '/services/user_service.ts';

const trackMailTokenGuard = () => {
    const middleware: Middleware = async (ctx: Context, next: () => Promise<unknown>) => {
        const authorization = ctx.request.headers.get('authorization');
        if (!authorization) {
            throw new httpErrors.Unauthorized('Missing Authorization header');
        }

        const [type, token] = authorization.split(' ');
        if (type !== 'Bearer' || !token?.trim()) throw new httpErrors.Unauthorized('Missing Authorization header');

        const userId: number = await getUserIdByToken(token); // Throw error if token is invalid or user not found
        const user: User = await getUserById(userId); // Throw error if user not found
        const contextUser: ContextUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles,
        };

        ctx.state.me = contextUser;

        await next();
    };
    return middleware;
};

export default trackMailTokenGuard;
