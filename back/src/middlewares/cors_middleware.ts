import { Context, Middleware } from 'oak';
import { get } from '/config.ts';
import { API_ROUTE } from '/routes/routes.ts';

const BASE_FRONT_URL = get('BASE_FRONT_URL');

if (!BASE_FRONT_URL) {
    console.error('Invalid BASE_FRONT_URL');
    Deno.exit(1);
}

const cors: Middleware = async (ctx: Context, next: () => Promise<unknown>) => {
    if (ctx.request.url.pathname.startsWith(API_ROUTE)) {
        ctx.response.headers.set('Access-Control-Allow-Credentials', 'true');
        ctx.response.headers.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        ctx.response.headers.set('Access-Control-Allow-Methods', 'DELETE, GET, OPTIONS, POST, PUT');
        ctx.response.headers.set('Access-Control-Allow-Origin', BASE_FRONT_URL);
    }

    await next();
};

export default cors;
