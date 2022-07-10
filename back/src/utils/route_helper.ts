import { oak } from '../../deps.ts';

const safeParseBody = async (ctx: oak.Context) => {
    try {
        const { value } = ctx.request.body({ type: 'json' });
        return await value;
    } catch (_err) {
        throw new oak.httpErrors.BadRequest('Invalid body');
    }
};

export { safeParseBody };
