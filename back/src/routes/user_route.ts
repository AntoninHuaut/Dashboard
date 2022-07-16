import { Context, helpers, httpErrors, Router, Status } from 'oak';
import { z } from 'zod';

import userGuard from '/middlewares/userguard_middleware.ts';
import * as userService from '/services/user_service.ts';
import { ICreateUser, IForgotUserPassword, IResetUserPassword, IUpdateUser, UserRole } from '/types/user_model.ts';
import { hasUserRole } from '/utils/role_helper.ts';
import { safeParseBody, validCaptchaToken } from '/utils/route_helper.ts';

const validUserId = z.number().min(1);
const validEmail = z.string().trim().email();
const validUsername = z.string().trim().min(3);
const validPassword = z.string().min(8);

const validCreateUser: z.ZodType<ICreateUser> = z.object({
    email: validEmail,
    username: validUsername,
    password: validPassword,
    confirmPassword: validPassword,
});

const validUpdateUser: z.ZodType<IUpdateUser> = z
    .object({ currentPassword: z.string(), newPassword: validPassword, confirmPassword: validPassword })
    .or(z.object({ email: validEmail }))
    .or(z.object({ username: validUsername }));

const validForgotPassword: z.ZodType<IForgotUserPassword> = z.object({
    email: validEmail,
});

const validResetPassword: z.ZodType<IResetUserPassword> = z.object({
    token: z.string().min(1),
    newPassword: validPassword,
    confirmPassword: validPassword,
});

const userRouter = new Router();

const getUsers = async (ctx: Context) => {
    ctx.response.body = await userService.getUsers();
};

const getUserById = async (ctx: Context) => {
    const { userIdStr } = helpers.getQuery(ctx, { mergeParams: true });
    const userId: number = validUserId.parse(+userIdStr);

    const user = await userService.getUserById(userId);
    ctx.response.body = user;
};

const createUser = async (ctx: Context) => {
    const body = await safeParseBody(ctx);
    await validCaptchaToken(body.captcha, ctx.request.ip);
    const userToCreate = validCreateUser.parse(body);

    const createdUser = await userService.createUser(userToCreate);
    if (createdUser) {
        ctx.response.status = Status.Created;
        ctx.response.body = createdUser;
    } else {
        throw new httpErrors.InternalServerError('User creation failed');
    }
};

const askForgotPassword = async (ctx: Context) => {
    const body = await safeParseBody(ctx);
    await validCaptchaToken(body.captcha, ctx.request.ip);
    const { email } = validForgotPassword.parse(body);

    await userService.askForgotPassword(email);
    ctx.response.status = Status.NoContent;
};

const resetPassword = async (ctx: Context) => {
    const body = await safeParseBody(ctx);
    await validCaptchaToken(body.captcha, ctx.request.ip);
    const resetPasswordForm = validResetPassword.parse(body);

    await userService.resetPassword(resetPasswordForm);
    ctx.response.status = Status.NoContent;
};

const updateUser = async (ctx: Context) => {
    const { userIdStr } = helpers.getQuery(ctx, { mergeParams: true });
    const userId: number = validUserId.parse(+userIdStr);

    const body = await safeParseBody(ctx);
    await validCaptchaToken(body.captcha, ctx.request.ip);
    const updatedUser = validUpdateUser.parse(body);

    const user = ctx.state.me;
    if (user.id == userId || hasUserRole(user, [UserRole.ADMIN])) {
        await userService.updateUser(userId, updatedUser);
        ctx.response.status = Status.NoContent;
    } else {
        throw new httpErrors.Forbidden('Forbidden user role');
    }
};

const deleteUser = async (ctx: Context) => {
    const { userIdStr, captcha } = helpers.getQuery(ctx, { mergeParams: true });
    await validCaptchaToken(captcha, ctx.request.ip);

    const userId: number = validUserId.parse(+userIdStr);

    const user = ctx.state.me;
    if (user.id == userId || hasUserRole(user, [UserRole.ADMIN])) {
        await userService.deleteUser(userId);
        ctx.response.status = Status.NoContent;
    } else {
        throw new httpErrors.Forbidden('Forbidden user role');
    }
};

userRouter.get('/', userGuard([UserRole.ADMIN]), getUsers);
userRouter.get('/:userIdStr', userGuard([UserRole.ADMIN]), getUserById);
userRouter.post('/', createUser);
userRouter.post('/forgotPassword', askForgotPassword);
userRouter.post('/resetPassword', resetPassword);
userRouter.put('/:userIdStr', userGuard([UserRole.USER]), updateUser);
userRouter.delete('/:userIdStr', userGuard([UserRole.USER]), deleteUser);

export default userRouter;
