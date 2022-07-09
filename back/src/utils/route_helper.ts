import { Context, httpErrors } from "oak";

const safeParseBody = async (ctx: Context) => {
  try {
    const { value } = ctx.request.body({ type: "json" });
    return await value;
  } catch (_err) {
    throw new httpErrors.BadRequest("Invalid body");
  }
};

export { safeParseBody };
