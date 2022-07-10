import { djwt } from '../../deps.ts';
import config from '../config.ts';
import { JWTUser } from '../types/auth_model.ts';
import { User } from '../types/user_model.ts';
import { TokenProperty } from '../types/auth_model.ts';

export const { JWT_ACCESS_TOKEN_EXP, JWT_REFRESH_TOKEN_EXP } = config;

if (isNaN(+JWT_ACCESS_TOKEN_EXP) || isNaN(+JWT_REFRESH_TOKEN_EXP)) {
    console.error('Invalid JWT configuration');
    Deno.exit(3);
}

const header: djwt.Header = {
    alg: 'HS512',
    typ: 'JWT',
};
let key: CryptoKey;

async function loadKey() {
    const fileName = 'jwk.json';
    try {
        const jwk = JSON.parse(await Deno.readTextFile(fileName));

        const keyAlgorithm = { name: 'HMAC', hash: 'SHA-512' };
        const keyData = {
            kty: jwk.kty,
            k: jwk.k,
            alg: jwk.alg,
            ext: jwk.ext,
        };

        key = await crypto.subtle.importKey('jwk', keyData, keyAlgorithm, false, jwk.key_ops as KeyUsage[]);

        console.log('JWT key loaded');
    } catch (_err) {
        key = await crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-512' }, true, ['sign', 'verify']);

        const exportedKeyJson = await crypto.subtle.exportKey('jwk', key);
        await Deno.writeTextFile(fileName, JSON.stringify(exportedKeyJson));

        console.log('JWT key created');
    }
}

await loadKey();

const getAuthToken = async (user: User): Promise<TokenProperty> => {
    const payload: djwt.Payload = {
        iss: 'learningreact-api',
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles.join(','),
        exp: djwt.getNumericDate(new Date().getTime() + +JWT_ACCESS_TOKEN_EXP),
    };

    return {
        value: await djwt.create(header, payload, key),
        maxAge: +JWT_ACCESS_TOKEN_EXP,
    };
};

const getRefreshToken = async (user: User): Promise<TokenProperty> => {
    const payload: djwt.Payload = {
        iss: 'deno-api',
        id: user.id,
        exp: djwt.getNumericDate(new Date().getTime() + +JWT_REFRESH_TOKEN_EXP),
    };

    return {
        value: await djwt.create(header, payload, key),
        maxAge: +JWT_REFRESH_TOKEN_EXP,
    };
};

const getJwtPayload = async (token: string): Promise<JWTUser | null> => {
    try {
        const payload: JWTUser = (await djwt.verify(token, key)) as unknown as JWTUser;
        return payload;
    } catch (_err) {
        return null;
    }
};

export { getAuthToken, getJwtPayload, getRefreshToken };
