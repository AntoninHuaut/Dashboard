import { Context, Router, httpErrors } from 'oak';

import userGuard from '../../middlewares/userguard_middleware.ts';
import { UserRole } from '../../types/user_model.ts';
import * as trackMailService from '/services/app/trackmail_service.ts';

const trackMailRouter = new Router();

const getTokenByUserId = async (ctx: Context) => {
    const user = ctx.state.me;
    const token = await trackMailService.getOrCreateTokenByUserId(user.id);

    if (!token) {
        throw new httpErrors.InternalServerError('Could not get or generate token');
    }

    ctx.response.body = { token: token };
};

const resetTokenByUserId = async (ctx: Context) => {
    const user = ctx.state.me;
    const token = await trackMailService.resetTokenByUserId(user.id);

    if (!token) {
        throw new httpErrors.InternalServerError('Could not reset and get token');
    }

    ctx.response.body = { token: token };
};

trackMailRouter.get('/token', userGuard([UserRole.USER]), getTokenByUserId);
trackMailRouter.post('/token', userGuard([UserRole.USER]), resetTokenByUserId);

export default trackMailRouter;
