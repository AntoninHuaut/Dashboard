import { Application } from 'oak';

import { config } from '/config.ts';
import setupMiddlewares from '/middlewares/middlewares.ts';
import { router } from '/routes/routes.ts';

const PORT = config.PORT ?? 8000;
const app = new Application();

setupMiddlewares(app);
app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Listening on localhost:${PORT}`);
await app.listen({ port: PORT });
