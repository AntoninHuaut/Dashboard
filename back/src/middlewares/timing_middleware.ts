import { Context, Middleware } from 'oak';
import config from '/config.ts';

const ENV = config.ENV;

const timing: Middleware = async (ctx: Context, next: () => Promise<unknown>) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.response.headers.set('X-Response-Time', `${ms}ms`);

    if (ENV === 'dev') {
        console.log(`${ctx.request.method} ${ctx.request.url} - ${ms}ms`);
    }
};

export default timing;
