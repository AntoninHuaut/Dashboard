import { config } from '/config.ts';

export interface IToken {
    value: string;
    exp: Date;
}

export const createToken = (): IToken => ({
    value: `${crypto.randomUUID()}-${crypto.randomUUID()}`,
    exp: new Date(new Date().getTime() + config.TOKEN_EXP * 1000),
});
