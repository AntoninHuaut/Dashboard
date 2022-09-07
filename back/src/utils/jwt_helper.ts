import { create, getNumericDate, Header, Payload, verify } from 'djwt';

import { config } from '/config.ts';
import { JWTUser, TokenProperty } from '/types/auth_model.ts';
import { IUser } from '/types/user_model.ts';

const header: Header = {
    alg: 'HS512',
    typ: 'JWT',
};
let key: CryptoKey;

async function loadKey() {
    const fileName = './data/jwk.json';
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

const getAuthToken = async (user: IUser): Promise<TokenProperty> => {
    const payload: Payload = {
        iss: 'dashboard-api',
        id: user.id,
        email: user.email,
        username: user.username,
        rolesStr: user.roles.join(','),
        exp: getNumericDate(new Date().getTime() + config.JWT_ACCESS_TOKEN_EXP),
    };

    return {
        value: await create(header, payload, key),
        maxAge: config.JWT_ACCESS_TOKEN_EXP,
    };
};

const getRefreshToken = async (user: IUser): Promise<TokenProperty> => {
    const payload: Payload = {
        iss: 'deno-api',
        id: user.id,
        exp: getNumericDate(new Date().getTime() + config.JWT_REFRESH_TOKEN_EXP),
    };

    return {
        value: await create(header, payload, key),
        maxAge: config.JWT_REFRESH_TOKEN_EXP,
    };
};

const getJWTUser = async (token: string): Promise<JWTUser | null> => {
    const payload: Payload | null = await verifyJWT(token);
    return payload ? (payload as unknown as JWTUser) : null;
};

const verifyJWT = async (token: string): Promise<Payload | null> => {
    try {
        return await verify(token, key);
    } catch (_err) {
        return null;
    }
};

export { getAuthToken, getJWTUser, getRefreshToken };
