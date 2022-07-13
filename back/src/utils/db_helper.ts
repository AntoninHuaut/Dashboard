import { get } from '/config.ts';

const TOKEN_EXP = get('TOKEN_EXP') ?? '';

if (isNaN(+TOKEN_EXP)) {
    console.error('Invalid TOKEN_EXP');
    Deno.exit(5);
}

export interface IToken {
    value: string;
    exp: Date;
}

export const getToken = (): IToken => ({
    value: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
    exp: new Date(new Date().getTime() + +TOKEN_EXP * 1000),
});
