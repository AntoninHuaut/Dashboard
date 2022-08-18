import { z } from 'zod';
import { Context, Router, httpErrors, helpers } from 'oak';

import userGuard from '../../middlewares/userguard_middleware.ts';
import { ICreateMail } from '../../types/app/trackmail_model.ts';
import { UserRole } from '../../types/user_model.ts';
import { safeParseBody } from '../../utils/route_helper.ts';
import * as trackMailService from '/services/app/trackmail_service.ts';

const trackMailRouter = new Router();

const validPage = z.number().min(0).default(0);

const validCreateMail: z.ZodType<ICreateMail> = z.object({
    emailFrom: z.string().min(1),
    emailTo: z.string().array().min(1),
    subject: z.string(),
});

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

const getMails = async (ctx: Context) => {
    const user = ctx.state.me;
    const { pageStr } = helpers.getQuery(ctx, { mergeParams: true });
    const page = validPage.parse(isNaN(+pageStr) ? undefined : +pageStr); // Use default value if NaN

    const mailCount = await trackMailService.getMailsCount(user.id);
    const mails = await trackMailService.getMails(user.id, page);

    ctx.response.body = {
        data: mails,
        pagination: {
            numberPerPage: trackMailService.NUMBER_OF_MAILS_PER_PAGE,
            offset: page * trackMailService.NUMBER_OF_MAILS_PER_PAGE,
            page: page,
            totalMail: mailCount,
        },
    };
};

const createMail = async (ctx: Context) => {
    const user = ctx.state.me;
    const body = await safeParseBody(ctx);
    const createMailBody = validCreateMail.parse(body);

    const createdMail = await trackMailService.createMail(user.id, createMailBody);

    ctx.response.body = createdMail; // TODO: add path to track pixel & track link
};

trackMailRouter.get('/token', userGuard([UserRole.USER]), getTokenByUserId);
trackMailRouter.post('/token', userGuard([UserRole.USER]), resetTokenByUserId);
trackMailRouter.get('/mail/:pageStr?', userGuard([UserRole.USER]), getMails);
trackMailRouter.post('/mail', userGuard([UserRole.USER]), createMail);

export default trackMailRouter;
