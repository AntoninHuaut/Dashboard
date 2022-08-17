import { Router } from 'oak';

import authRouter from './auth_route.ts';
import userRouter from './user_route.ts';

const router = new Router();
const api = new Router();

api.get('/', (ctx) => {
    ctx.response.body = { status: 'UP' };
});

export const API_ROUTE = '/api';

const API_ROUTE_v1 = `${API_ROUTE}/v1`;
const AUTH_ROUTE = '/auth';
const USER_ROUTE = '/user';

export const getAuthRoute = () => `${API_ROUTE_v1}${AUTH_ROUTE}`;

api.use(`${AUTH_ROUTE}`, authRouter.routes());
api.use(`${USER_ROUTE}`, userRouter.routes());

router.use(`${API_ROUTE_v1}`, api.routes());

export { router };
