import { Context, Middleware } from 'oak';

import { config } from '/config.ts';
import { API_ROUTE } from '/routes/routes.ts';

const cors: Middleware = async (ctx: Context, next: () => Promise<unknown>) => {
    if (ctx.request.url.pathname.startsWith(API_ROUTE)) {
        ctx.response.headers.set('Access-Control-Allow-Credentials', 'true');
        ctx.response.headers.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        ctx.response.headers.set('Access-Control-Allow-Methods', 'DELETE, GET, OPTIONS, POST, PUT');
        ctx.response.headers.set('Access-Control-Allow-Origin', config.BASE_FRONT_URL);
    }

    await next();
};

export default cors;
