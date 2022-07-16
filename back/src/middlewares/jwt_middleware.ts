import { Context, Middleware } from 'oak';

import { JWTUser } from '/types/auth_model.ts';
import { ContextUser, UserRole } from '/types/user_model.ts';
import { getJWTUser } from '/utils/jwt_helper.ts';

const jwt: Middleware = async (ctx: Context, next: () => Promise<unknown>) => {
    try {
        const access_token = await ctx.cookies.get('access_token');
        if (access_token) {
            const jwtUser: JWTUser | null = await getJWTUser(access_token);

            if (jwtUser) {
                const roles: UserRole[] = jwtUser.rolesStr.split(',') as UserRole[];

                const ctxUser: ContextUser = {
                    id: jwtUser.id,
                    email: jwtUser.email,
                    username: jwtUser.username,
                    roles: roles,
                };

                ctx.state.me = ctxUser;
            } else {
                await ctx.cookies.delete('access_token');
            }
        }
    } catch (err) {
        console.error(err);
    }

    await next();
};

export default jwt;
