import { z } from "zod";
import { Context, helpers, httpErrors, Router, Status } from "oak";
import * as userService from "/services/user_service.ts";
import userGuard from "/middlewares/userguard_middleware.ts";
import { UserRole } from "/types/user_model.ts";
import { hasUserRole } from "/utils/role_helper.ts";
import { safeParseBody } from "/utils/route_helper.ts";

const validUserId = z.number().min(1);
const validCreateUser = z.object({
  email: z.string().trim().email(),
  username: z.string().trim().min(1),
  password: z.string().min(8),
});
const validUpdateUser = z.object({
  password: z.string().min(8),
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
  const createUser = validCreateUser.parse(body);

  ctx.response.body = await userService.createUser(
    createUser.email,
    createUser.username,
    createUser.password,
  );
};

const updateUser = async (ctx: Context) => {
  const { userIdStr } = helpers.getQuery(ctx, { mergeParams: true });
  const userId: number = validUserId.parse(+userIdStr);

  const body = await safeParseBody(ctx);
  const updatedUser = validUpdateUser.parse(body);

  const user = ctx.state.me;
  if (user.id == userId || hasUserRole(user, [UserRole.ADMIN])) {
    await userService.updateUser(userId, updatedUser.password);
    ctx.response.status = Status.NoContent;
  } else {
    throw new httpErrors.Forbidden("Forbidden user role");
  }
};

const deleteUser = async (ctx: Context) => {
  const { userIdStr } = helpers.getQuery(ctx, { mergeParams: true });
  const userId: number = validUserId.parse(+userIdStr);

  await userService.deleteUser(userId);
  ctx.response.status = Status.NoContent;
};

userRouter.get("/", userGuard([UserRole.ADMIN]), getUsers);
userRouter.get("/:userIdStr", userGuard([UserRole.ADMIN]), getUserById);
userRouter.post("/", createUser);
userRouter.put("/:userIdStr", userGuard([UserRole.USER]), updateUser);
userRouter.delete("/:userIdStr", userGuard([UserRole.ADMIN]), deleteUser);

export default userRouter;
