import { Application } from 'oak';
import { oakCors } from 'oakCors';
import { router } from '/routes/routes.ts';
import setupMiddlewares from '/middlewares/middlewares.ts';
import config from '/config.ts';

const PORT = 8000;
const ENV = config.ENV;

if (ENV !== 'dev' && !config.CORS_ORIGIN) {
    console.error('Invalid CORS_ORIGIN');
    Deno.exit(1);
}

const app = new Application();

app.use(
    oakCors({
        origin: ENV === 'dev' ? '*' : config.CORS_ORIGIN,
        credentials: true,
    })
);
setupMiddlewares(app);
app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Listening on localhost:${PORT}`);
await app.listen({ port: PORT });
