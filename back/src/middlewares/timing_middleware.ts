import { oak } from '../../deps.ts';
import config from '../config.ts';

const ENV = config.ENV;

const timing: oak.Middleware = async (ctx: oak.Context, next: () => Promise<unknown>) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.response.headers.set('X-Response-Time', `${ms}ms`);

    if (ENV === 'dev') {
        console.log(`${ctx.request.method} ${ctx.request.url} - ${ms}ms`);
    }
};

export default timing;
