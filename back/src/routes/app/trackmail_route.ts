import { z } from 'zod';
import { Context, Router, httpErrors, helpers, Status } from 'oak';

import userGuard from '../../middlewares/userguard_middleware.ts';
import { ICreateMail, ITrackMailSettings } from '../../types/app/trackmail_model.ts';
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

const validUpdateSettings: z.ZodType<ITrackMailSettings> = z.object({
    logEmailFrom: z.boolean(),
    logEmailTo: z.boolean(),
    logSubject: z.boolean(),
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
    const user = ctx.state.me;
    const body = await safeParseBody(ctx);
    const newSettings = validUpdateSettings.parse(body);

    await trackMailService.updateSettings(user.id, newSettings);
    ctx.response.status = Status.NoContent;
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

trackMailRouter.get('/token', userGuard([UserRole.USER]), getToken);
trackMailRouter.post('/token', userGuard([UserRole.USER]), resetToken);

trackMailRouter.get('/settings', userGuard([UserRole.USER]), getSettings);
trackMailRouter.post('/settings', userGuard([UserRole.USER]), updateSettings);

trackMailRouter.get('/mail/:pageStr?', userGuard([UserRole.USER]), getMails);
trackMailRouter.post('/mail', userGuard([UserRole.USER]), createMail);

export default trackMailRouter;
