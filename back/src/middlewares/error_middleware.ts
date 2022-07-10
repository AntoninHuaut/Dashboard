import { zod, oak } from '../../deps.ts';
import config from '../config.ts';

const ENV = config.ENV;

const error: oak.Middleware = async (ctx: oak.Context, next: () => Promise<unknown>) => {
    try {
        await next();
    } catch (err) {
        let status = err.status || err.statusCode || oak.Status.InternalServerError;
        let message = err.message;

        if (err instanceof zod.ZodError) {
            message = JSON.parse(err.message);
            status = 400;
        } else if (!oak.isHttpError(err) || !err.expose) {
            message = ENV === 'dev' ? message : 'Internal Server Error';
        }

        if (ENV === 'dev') {
            console.error(status, ctx.request.url.href, err);
        }

        ctx.response.status = status;
        ctx.response.body = { status, message };
    }
};

export default error;
