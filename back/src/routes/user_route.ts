import { zod, oak } from '../../deps.ts';
import * as userService from '../services/user_service.ts';
import userGuard from '../middlewares/userguard_middleware.ts';
import { UserRole } from '../types/user_model.ts';
import { hasUserRole } from '../utils/role_helper.ts';
import { safeParseBody } from '../utils/route_helper.ts';

const validUserId = zod.number().min(1);
const validEmail = zod.string().trim().email();
const validUsername = zod.string().trim().min(3);
const validPassword = zod.string().min(8);

const validCreateUser = zod.object({
    email: validEmail,
    username: validUsername,
    password: validPassword,
    confirmPassword: validPassword,
});

const validUpdateUser = zod
    .object({ currentPassword: zod.string(), newPassword: validPassword, confirmPassword: validPassword })
    .or(zod.object({ email: validEmail }))
    .or(zod.object({ username: validUsername }));

const userRouter = new oak.Router();

const getUsers = async (ctx: oak.Context) => {
    ctx.response.body = await userService.getUsers();
};

const getUserById = async (ctx: oak.Context) => {
    const { userIdStr } = oak.helpers.getQuery(ctx, { mergeParams: true });
    const userId: number = validUserId.parse(+userIdStr);

    const user = await userService.getUserById(userId);
    ctx.response.body = user;
};

const createUser = async (ctx: oak.Context) => {
    const body = await safeParseBody(ctx);
    const userToCreate = validCreateUser.parse(body);

    const createdUser = await userService.createUser(userToCreate);
    if (createdUser) {
        ctx.response.status = oak.Status.Created;
        ctx.response.body = createdUser;
    } else {
        throw new oak.httpErrors.InternalServerError('User creation failed');
    }
};

const updateUser = async (ctx: oak.Context) => {
    const { userIdStr } = oak.helpers.getQuery(ctx, { mergeParams: true });
    const userId: number = validUserId.parse(+userIdStr);

    const body = await safeParseBody(ctx);
    const updatedUser = validUpdateUser.parse(body);

    const user = ctx.state.me;
    if (user.id == userId || hasUserRole(user, [UserRole.ADMIN])) {
        await userService.updateUser(userId, updatedUser);
        ctx.response.status = oak.Status.NoContent;
    } else {
        throw new oak.httpErrors.Forbidden('Forbidden user role');
    }
};

const deleteUser = async (ctx: oak.Context) => {
    const { userIdStr } = oak.helpers.getQuery(ctx, { mergeParams: true });
    const userId: number = validUserId.parse(+userIdStr);

    const user = ctx.state.me;
    if (user.id == userId || hasUserRole(user, [UserRole.ADMIN])) {
        await userService.deleteUser(userId);
        ctx.response.status = oak.Status.NoContent;
    } else {
        throw new oak.httpErrors.Forbidden('Forbidden user role');
    }
};

userRouter.get('/', userGuard([UserRole.ADMIN]), getUsers);
userRouter.get('/:userIdStr', userGuard([UserRole.ADMIN]), getUserById);
userRouter.post('/', createUser);
userRouter.put('/:userIdStr', userGuard([UserRole.USER]), updateUser);
userRouter.delete('/:userIdStr', userGuard([UserRole.USER]), deleteUser);

export default userRouter;
