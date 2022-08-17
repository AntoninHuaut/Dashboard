import { Context, httpErrors, Middleware } from 'oak';

import { User, UserRole } from '/types/user_model.ts';
import { hasSomeUserRole } from '/utils/role_helper.ts';

const userGuard = (roles?: UserRole[]) => {
    const middleware: Middleware = async (ctx: Context, next: () => Promise<unknown>) => {
        const user: User | null = ctx.state.me;
        if (!user) {
            throw new httpErrors.Unauthorized('Unauthorized guest user');
        }

        if (roles && !hasSomeUserRole(user, roles)) {
            throw new httpErrors.Forbidden('Forbidden user role');
        }

        await next();
    };
    return middleware;
};

export default userGuard;
