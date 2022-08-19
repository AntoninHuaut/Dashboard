import { Context, helpers, Router, Status } from 'oak';
import { z } from 'zod';

import trackMailTokenGuard from '/middlewares/app/trackmailtokenguard_middleware.ts';
import userGuard from '/middlewares/userguard_middleware.ts';
import * as trackMailService from '/services/app/trackmail_service.ts';
import { ICreateMail, ITrackMailSettings } from '/types/app/trackmail_model.ts';
import { UserRole } from '/types/user_model.ts';
import { safeParseBody } from '/utils/route_helper.ts';

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
    const user = ctx.state.me;
    const settings = await trackMailService.getSettings(user.id);

    ctx.response.body = settings;
};

const updateSettings = async (ctx: Context) => {
    const body = await safeParseBody(ctx);
    const newSettings = validUpdateSettings.parse(body);

    const user = ctx.state.me;
    await trackMailService.updateSettings(user.id, newSettings);
    ctx.response.status = Status.NoContent;
};

const getMails = async (ctx: Context) => {
    const { pageStr } = helpers.getQuery(ctx, { mergeParams: true });
    const page = validPage.parse(isNaN(+pageStr) ? undefined : +pageStr); // Use default value if NaN

    const user = ctx.state.me;
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
    const body = await safeParseBody(ctx);
    const createMailBody = validCreateMail.parse(body);

    const user = ctx.state.me;
    const createdMail = await trackMailService.createMail(user.id, createMailBody);

    ctx.response.body = createdMail; // TODO: add path to track pixel & track link
};

trackMailRouter.get('/token', userGuard([UserRole.USER]), getToken);
trackMailRouter.post('/token', userGuard([UserRole.USER]), resetToken);

trackMailRouter.get('/settings', trackMailTokenGuard(), getSettings);
trackMailRouter.post('/settings', trackMailTokenGuard(), updateSettings);

trackMailRouter.get('/mail/:pageStr?', trackMailTokenGuard(), getMails);
trackMailRouter.post('/mail', trackMailTokenGuard(), createMail);

export default trackMailRouter;
