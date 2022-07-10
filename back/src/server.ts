import { Application } from 'oak';
import { router } from '/routes/routes.ts';
import setupMiddlewares from '/middlewares/middlewares.ts';

const PORT = 8000;

const app = new Application();

setupMiddlewares(app);
app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Listening on localhost:${PORT}`);
await app.listen({ port: PORT });
