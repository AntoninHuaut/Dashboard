import { get } from '/config.ts';

const REGISTRATION_TOKEN_EXP = get('REGISTRATION_TOKEN_EXP') ?? '';

if (isNaN(+REGISTRATION_TOKEN_EXP)) {
    console.error('Invalid REGISTRATION_TOKEN_EXP');
    Deno.exit(5);
}

export interface IRegistrationToken {
    value: string;
    exp: Date;
}

export const getRegistrationToken = (): IRegistrationToken => ({
    value: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
    exp: new Date(new Date().getTime() + +REGISTRATION_TOKEN_EXP * 1000),
});
