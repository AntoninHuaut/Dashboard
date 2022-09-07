import { config } from '/config.ts';

export interface IToken {
    value: string;
    exp: Date;
}

export const TOKEN_BYTES_LENGTH = 64;
export const TOKEN_STRING_LENGTH = TOKEN_BYTES_LENGTH * 2;

export const createToken = (): IToken => ({
    value: randomHex(TOKEN_BYTES_LENGTH),
    exp: new Date(new Date().getTime() + config.TOKEN_EXP * 1000),
});

function randomHex(n: number) {
    const bytes = new Uint8Array(n);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}
