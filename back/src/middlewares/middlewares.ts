import { Application } from 'oak';

import timing from './timing_middleware.ts';
import jwt from './jwt_middleware.ts';
import error from './error_middleware.ts';
import cors from './cors_middleware.ts';

const setupMiddlewares = (app: Application) => {
    app.use(cors);
    app.use(error);
    app.use(timing);
    app.use(jwt);
};

export default setupMiddlewares;
