import { create, getNumericDate, Header, Payload, verify } from 'djwt';
import { get } from '/config.ts';
import { JWTUser } from '/types/auth_model.ts';
import { User, ICreateUser } from '/types/user_model.ts';
import { TokenProperty } from '/types/auth_model.ts';

const JWT_ACCESS_TOKEN_EXP = get('JWT_ACCESS_TOKEN_EXP') ?? '';
const JWT_REFRESH_TOKEN_EXP = get('JWT_REFRESH_TOKEN_EXP') ?? '';
const JWT_REGISTRATION_TOKEN_EXP = get('JWT_REGISTRATION_TOKEN_EXP') ?? '';

if (isNaN(+JWT_ACCESS_TOKEN_EXP) || isNaN(+JWT_REFRESH_TOKEN_EXP) || isNaN(+JWT_REGISTRATION_TOKEN_EXP)) {
    console.error('Invalid JWT configuration');
    Deno.exit(2);
}

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

const getRegistrationToken = async (user: ICreateUser): Promise<TokenProperty> => {
    const payload: Payload = {
        iss: 'learningreact-api-registration',
        email: user.email,
        username: user.username,
        exp: getNumericDate(new Date().getTime() + +JWT_REGISTRATION_TOKEN_EXP),
    };

    return {
        value: await create(header, payload, key),
        maxAge: +JWT_REGISTRATION_TOKEN_EXP,
    };
};

const getAuthToken = async (user: User): Promise<TokenProperty> => {
    const payload: Payload = {
        iss: 'learningreact-api',
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles.join(','),
        exp: getNumericDate(new Date().getTime() + +JWT_ACCESS_TOKEN_EXP),
    };

    return {
        value: await create(header, payload, key),
        maxAge: +JWT_ACCESS_TOKEN_EXP,
    };
};

const getRefreshToken = async (user: User): Promise<TokenProperty> => {
    const payload: Payload = {
        iss: 'deno-api',
        id: user.id,
        exp: getNumericDate(new Date().getTime() + +JWT_REFRESH_TOKEN_EXP),
    };

    return {
        value: await create(header, payload, key),
        maxAge: +JWT_REFRESH_TOKEN_EXP,
    };
};

const getJWTUser = async (token: string): Promise<JWTUser | null> => {
    try {
        const payload: JWTUser = (await verifyJWT(token)) as unknown as JWTUser;
        return payload;
    } catch (_err) {
        return null;
    }
};

const verifyJWT = async (token: string): Promise<Payload | null> => {
    try {
        return await verify(token, key);
    } catch (_err) {
        return null;
    }
};

export { getRegistrationToken, getAuthToken, getJWTUser, getRefreshToken };
