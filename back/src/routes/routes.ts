import { Router } from "oak";
import userRouter from "./user_route.ts";
import authRouter from "./auth_route.ts";

const router = new Router();
const api = new Router();

api.get("/", (ctx) => {
  ctx.response.body = "UP";
});

const API_ROUTE = "/api/v1"
const AUTH_ROUTE = "/auth"
const USER_ROUTE = "/user"

export const getAuthRoute = () => `${API_ROUTE}${AUTH_ROUTE}`

api.use(`${AUTH_ROUTE}`, authRouter.routes());
api.use(`${USER_ROUTE}`, userRouter.routes());

router.use(`${API_ROUTE}`, api.routes());

export { router };
