import { Context, Middleware } from 'oak';
import config from '/config.ts';
import { API_ROUTE } from '/routes/routes.ts';

const { ENV, CORS_ORIGIN } = config;

if (ENV !== 'dev' && !CORS_ORIGIN) {
    console.error('Invalid CORS_ORIGIN');
    Deno.exit(1);
}

const cors: Middleware = async (ctx: Context, next: () => Promise<unknown>) => {
    await next();

    if (ctx.request.url.pathname.startsWith(API_ROUTE)) {
        ctx.response.headers.set('Access-Control-Allow-Origin', ENV === 'dev' ? '*' : CORS_ORIGIN);
        ctx.response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
};

export default cors;
