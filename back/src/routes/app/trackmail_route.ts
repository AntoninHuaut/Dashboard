import { Context, helpers, Router, send, Status } from 'oak';
import { z } from 'zod';

import trackMailTokenGuard from '/middlewares/app/trackmailtokenguard_middleware.ts';
import userGuard from '/middlewares/userguard_middleware.ts';
import * as trackMailService from '/services/app/trackmail_service.ts';
import { ICreateMail, IMail, IPagination, IPixelTrack, ITrackMailSettings } from '/types/app/trackmail_model.ts';
import { API_ROUTE_APP_TRACKMAIL } from '/types/route_model.ts';
import { UserRole } from '/types/user_model.ts';
import { TOKEN_STRING_LENGTH } from '/utils/db_helper.ts';
import { safeParseBody } from '/utils/route_helper.ts';

const pixelTrackPathRoute = 'pixelTrack';
const linkTrackPathRoute = 'linkTrack';

const trackMailRouter = new Router();

const validPage = z.number().min(0).default(0);
const validMailId = z.string().min(TOKEN_STRING_LENGTH).max(TOKEN_STRING_LENGTH);
const validLinkUrl = z.string().url().max(512);

const validCreateMail: z.ZodType<ICreateMail> = z.object({
    email_from: z.string().min(1).max(255),
    email_to: z.string().array().min(1).max(2048),
    subject: z.string().max(255),
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

const getMailsCount = async (ctx: Context) => {
    const user = ctx.state.me;
    const mailCount = await trackMailService.getMailsCount(user.id);
    ctx.response.body = { total: mailCount };
};

const getMails = async (ctx: Context) => {
    const { pageStr } = helpers.getQuery(ctx, { mergeParams: true });
    const page = validPage.parse(isNaN(+pageStr) ? undefined : +pageStr); // Use default value if NaN

    const user = ctx.state.me;
    const mailCount = await trackMailService.getMailsCount(user.id);
    const mails = await trackMailService.getMails(user.id, page);

    const bodyResponse: { data: IMail[]; pagination: IPagination } = {
        data: mails,
        pagination: {
            numberPerPage: trackMailService.NUMBER_OF_ITEMS_PER_PAGE,
            offset: page * trackMailService.NUMBER_OF_ITEMS_PER_PAGE,
            page: page,
            total: mailCount,
        },
    };

    ctx.response.body = bodyResponse;
};

const getMailById = async (ctx: Context) => {
    const { emailIdStr } = helpers.getQuery(ctx, { mergeParams: true });
    const emailId = validMailId.parse(emailIdStr);

    const user = ctx.state.me;
    const mail = await trackMailService.getMailById(user.id, emailId);

    ctx.response.body = mail;
};

const createMail = async (ctx: Context) => {
    const body = await safeParseBody(ctx);
    const createMailBody = validCreateMail.parse(body);

    const user = ctx.state.me;
    const createdMail = await trackMailService.createMail(user.id, createMailBody);

    ctx.response.status = Status.Created;
    ctx.response.body = {
        ...createdMail,
        __paths: {
            pixel: `${API_ROUTE_APP_TRACKMAIL}/${pixelTrackPathRoute}/${createdMail.email_id}`,
            link: `${API_ROUTE_APP_TRACKMAIL}/${linkTrackPathRoute}/${createdMail.email_id}`,
        },
    };
};

const deleteMail = async (ctx: Context) => {
    const { emailIdStr } = helpers.getQuery(ctx, { mergeParams: true });
    const emailId = validMailId.parse(emailIdStr);

    const user = ctx.state.me;
    await trackMailService.deleteMail(user.id, emailId);

    ctx.response.status = Status.NoContent;
};

const imagePixelTrack = async (ctx: Context) => {
    const { emailIdStr } = helpers.getQuery(ctx, { mergeParams: true });
    const emailId = validMailId.parse(emailIdStr);
    const userIp = ctx.request.ips[0];

    await trackMailService.pixelTrack(emailId, userIp);

    await send(ctx, 'trackmail_pixel.png', {
        root: `${Deno.cwd()}/static`,
    });
};

const linkTrack = async (ctx: Context) => {
    const { emailIdStr, linkUrlStr } = helpers.getQuery(ctx, { mergeParams: true });
    const emailId = validMailId.parse(emailIdStr);
    const linkUrl = validLinkUrl.parse(linkUrlStr);
    const userIp = ctx.request.ips[0];

    await trackMailService.linkTrack(emailId, userIp, linkUrl);

    ctx.response.redirect(linkUrl);
};

const getLogsTrackCount = async (ctx: Context) => {
    const { emailIdStr } = helpers.getQuery(ctx, { mergeParams: true });
    const emailId = validMailId.parse(emailIdStr);

    const user = ctx.state.me;
    const logsTrackCount = await trackMailService.getLogsTrackCount(user.id, emailId);

    ctx.response.body = { total: logsTrackCount };
};

const getLogsTrack = async (ctx: Context) => {
    const { emailIdStr, pageStr } = helpers.getQuery(ctx, { mergeParams: true });
    const page = validPage.parse(isNaN(+pageStr) ? undefined : +pageStr); // Use default value if NaN
    const emailId = validMailId.parse(emailIdStr);

    const user = ctx.state.me;
    const logsTrackCount = await trackMailService.getLogsTrackCount(user.id, emailId);
    const logsTrack = await trackMailService.getLogsTrack(user.id, emailId, page);

    const bodyResponse: { data: IPixelTrack[]; pagination: IPagination } = {
        data: logsTrack,
        pagination: {
            numberPerPage: trackMailService.NUMBER_OF_ITEMS_PER_PAGE,
            offset: page * trackMailService.NUMBER_OF_ITEMS_PER_PAGE,
            page: page,
            total: logsTrackCount,
        },
    };

    ctx.response.body = bodyResponse;
};

export const deleteSelfTrack = async (ctx: Context) => {
    const { emailIdStr } = helpers.getQuery(ctx, { mergeParams: true });
    const emailId = validMailId.parse(emailIdStr);
    const userIp = ctx.request.ips[0];
    const user = ctx.state.me;

    await trackMailService.deleteSelfTrack(user.id, emailId, userIp);

    ctx.response.status = Status.NoContent;
};

trackMailRouter.get('/token', userGuard([UserRole.USER]), getToken);
trackMailRouter.post('/token', userGuard([UserRole.USER]), resetToken);

trackMailRouter.get('/settings', trackMailTokenGuard(), getSettings);
trackMailRouter.put('/settings', trackMailTokenGuard(), updateSettings);

trackMailRouter.get('/mail/count', trackMailTokenGuard(), getMailsCount);
trackMailRouter.get('/mail/all/:pageStr?', trackMailTokenGuard(), getMails);
trackMailRouter.get('/mail/:emailIdStr', trackMailTokenGuard(), getMailById);
trackMailRouter.post('/mail', trackMailTokenGuard(), createMail);
trackMailRouter.delete('/mail/:emailIdStr', trackMailTokenGuard(), deleteMail);

trackMailRouter.get(`/${pixelTrackPathRoute}/:emailIdStr`, imagePixelTrack);
trackMailRouter.get(`/${linkTrackPathRoute}/:emailIdStr/:linkUrlStr`, linkTrack);
trackMailRouter.get('/logsTrack/:emailIdStr/count', trackMailTokenGuard(), getLogsTrackCount);
trackMailRouter.get('/logsTrack/:emailIdStr/:pageStr?', trackMailTokenGuard(), getLogsTrack);
trackMailRouter.delete('/selfPixelTrack/:emailIdStr', trackMailTokenGuard(), deleteSelfTrack);

export const isAnyAccessControlAllowOrigin = (ctx: Context, apiRouteAppTrackMail: string) =>
    ctx.request.url.pathname.startsWith(apiRouteAppTrackMail) && ctx.request.url.pathname !== `${apiRouteAppTrackMail}/token`;

export default trackMailRouter;
