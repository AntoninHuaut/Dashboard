import { Router } from 'oak';

import authRouter from './auth_route.ts';
import userRouter from './user_route.ts';
import trackMailRouter from './app/trackmail_route.ts';

export enum RouteEnum {
    AUTH = 'auth',
    USER = 'user',
    APP_TRACKMAIL = 'app/trackmail',
}

export const API_ROUTE = '/api';
const API_ROUTE_v1 = `${API_ROUTE}/v1`;

export const router = new Router();
const api = new Router();

api.get('/', (ctx) => {
    ctx.response.body = { status: 'UP' };
});

api.use(`/${RouteEnum.AUTH}`, authRouter.routes());
api.use(`/${RouteEnum.USER}`, userRouter.routes());
api.use(`/${RouteEnum.APP_TRACKMAIL}`, trackMailRouter.routes());

router.use(`${API_ROUTE_v1}`, api.routes());

export const getAuthRoute = () => `${API_ROUTE_v1}/${RouteEnum.AUTH}`;
