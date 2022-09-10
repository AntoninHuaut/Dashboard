import { Router } from 'oak';

import authRouter from './auth_route.ts';
import userRouter from './user_route.ts';
import trackMailRouter from './app/trackmail_route.ts';
import { API_ROUTE, RouteEnum } from '/types/route_model.ts';

export const router = new Router();
const api = new Router();

api.get('/', (ctx) => {
    ctx.response.body = { status: 'UP' };
});

api.use(`/${RouteEnum.AUTH}`, authRouter.routes());
api.use(`/${RouteEnum.USER}`, userRouter.routes());
api.use(`/${RouteEnum.APP_TRACKMAIL}`, trackMailRouter.routes());

router.use(`${API_ROUTE}`, api.routes());

export const getAuthRoute = () => `${API_ROUTE}/${RouteEnum.AUTH}`;
