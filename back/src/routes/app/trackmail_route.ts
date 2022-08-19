import { z } from 'zod';
import { Context, Router, helpers, Status, httpErrors } from 'oak';

import userGuard from '../../middlewares/userguard_middleware.ts';
import { ICreateMail, ITrackMailSettings } from '../../types/app/trackmail_model.ts';
import { UserRole } from '../../types/user_model.ts';
import { safeParseBody } from '../../utils/route_helper.ts';
import * as trackMailService from '/services/app/trackmail_service.ts';

const trackMailRouter = new Router();

const validPage = z.number().min(0).default(0);

const validCreateMail: z.ZodType<ICreateMail> = z.object({
    email_from: z.string().min(1),
    email_to: z.string().array().min(1),
    subject: z.string(),
});

const validUpdateSettings: z.ZodType<ITrackMailSettings> = z.object({
    log_email_from: z.boolean(),
    log_email_to: z.boolean(),
    log_subject: z.boolean(),
});

const getToken = async (ctx: Context) => {
    const user = ctx.state.me;
    const token = await trackMailService.getOrCreateToken(user.id);

    ctx.response.body = { token };
};

const resetToken = async (ctx: Context) => {
    const user = ctx.state.me;
    const token = await trackMailService.resetToken(user.id);

    ctx.response.body = { token };
};

const getSettings = async (ctx: Context) => {
    const userId = await safeGetUserIdByToken(ctx);
    const settings = await trackMailService.getSettings(userId);

    ctx.response.body = settings;
};

const updateSettings = async (ctx: Context) => {
    const userId = await safeGetUserIdByToken(ctx);
    const body = await safeParseBody(ctx);
    const newSettings = validUpdateSettings.parse(body);

    await trackMailService.updateSettings(userId, newSettings);
    ctx.response.status = Status.NoContent;
};

const getMails = async (ctx: Context) => {
    const userId = await safeGetUserIdByToken(ctx);
    const { pageStr } = helpers.getQuery(ctx, { mergeParams: true });
    const page = validPage.parse(isNaN(+pageStr) ? undefined : +pageStr); // Use default value if NaN

    const mailCount = await trackMailService.getMailsCount(userId);
    const mails = await trackMailService.getMails(userId, page);

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
    const userId = await safeGetUserIdByToken(ctx);
    const body = await safeParseBody(ctx);
    const createMailBody = validCreateMail.parse(body);

    const createdMail = await trackMailService.createMail(userId, createMailBody);

    ctx.response.body = createdMail; // TODO: add path to track pixel & track link
};

trackMailRouter.get('/token', userGuard([UserRole.USER]), getToken);
trackMailRouter.post('/token', userGuard([UserRole.USER]), resetToken);

trackMailRouter.get('/settings', getSettings);
trackMailRouter.post('/settings', updateSettings);

trackMailRouter.get('/mail/:pageStr?', getMails);
trackMailRouter.post('/mail', createMail);

export default trackMailRouter;

function safeGetUserIdByToken(ctx: Context): Promise<number> {
    return trackMailService.getUserIdByToken(extractTrackMailToken(ctx));
}

function extractTrackMailToken(ctx: Context): string {
    const authorization = ctx.request.headers.get('authorization');
    if (!authorization) {
        throw new httpErrors.BadRequest('Missing Authorization header');
    }

    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer' || !token?.trim()) throw new httpErrors.BadRequest('Missing Authorization header');

    return token;
}
