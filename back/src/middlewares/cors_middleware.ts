import { Context, Middleware } from 'oak';

import { config } from '/config.ts';
import { API_ROUTE, API_ROUTE_APP_TRACKMAIL } from '/routes/routes.ts';

const cors: Middleware = async (ctx: Context, next: () => Promise<unknown>) => {
    if (ctx.request.url.pathname.startsWith(API_ROUTE)) {
        ctx.response.headers.set('Access-Control-Allow-Credentials', 'true');
        ctx.response.headers.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        ctx.response.headers.set('Access-Control-Allow-Methods', 'DELETE, GET, OPTIONS, POST, PUT');

        if (ctx.request.url.pathname.startsWith(API_ROUTE_APP_TRACKMAIL)) {
            ctx.response.headers.set('Access-Control-Allow-Origin', '*');
        } else {
            ctx.response.headers.set('Access-Control-Allow-Origin', config.BASE_FRONT_URL);
        }
    }

    await next();
};

export default cors;
