import { oak } from '../../deps.ts';
import timing from './timing_middleware.ts';
import jwt from './jwt_middleware.ts';
import error from './error_middleware.ts';

const setupMiddlewares = (app: oak.Application) => {
    app.use(error);
    app.use(timing);
    app.use(jwt);
};

export default setupMiddlewares;
