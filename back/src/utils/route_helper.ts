import { Context, httpErrors, isHttpError } from 'oak';

import { config } from '/config.ts';

// deno-lint-ignore no-explicit-any
export const safeParseBody = async (ctx: Context): Promise<Record<string, any>> => {
    try {
        const { value } = ctx.request.body({ type: 'json' });
        return await value;
    } catch (_err) {
        throw new httpErrors.BadRequest('Invalid body');
    }
};

export const validCaptchaToken = async (token: string, userIpAdress: string) => {
    if (config.ENV === 'dev') return;

    try {
        const json = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: config.RECAPTCHA_SERVER_SECRET,
                response: token,
                remoteip: userIpAdress,
            }),
        }).then((res) => res.json());

        if (json.success !== true) {
            const errArray = json['error-codes'];
            const errorMsg = Array.isArray(errArray) ? errArray.join(', ') : errArray;

            throw new httpErrors.BadRequest('Invalid captcha token: ' + errorMsg);
        }

        if (json.number < config.MIN_RECAPTCHA_STORE) {
            throw new httpErrors.BadRequest('Captcha score is too low');
        }
    } catch (err) {
        if (isHttpError(err)) throw err;

        throw new httpErrors.InternalServerError('Captcha verification error', {
            cause: err,
        });
    }
};
