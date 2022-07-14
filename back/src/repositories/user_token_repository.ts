import { IToken } from '../utils/db_helper.ts';
import { sql } from '/external/db.ts';

export type TOKEN_TYPE = 'registration' | 'forgot_password';

export const insertToken = async (token: string, tokenExp: Date): Promise<number | null> => {
    const result = await sql` INSERT INTO "users_token" ( "token_value", "token_exp" ) 
        VALUES ( ${token}, ${tokenExp} ) 
        RETURNING "token_id"; `;

    return result.length && result[0].token_id ? result[0].token_id : null;
};

export const deleteToken = async (token: string): Promise<boolean> => {
    const result = await sql` DELETE FROM "users_token" WHERE "token_value" = ${token}; `;

    return result.count > 0;
};

export const getTokenByTokenTypeAndUserId = async (userId: number, tokenType: TOKEN_TYPE): Promise<IToken | null> => {
    const result = await sql` SELECT * FROM "users_token" ut
        JOIN "users" u on ut.token_id = ${sql([`u.${getTokenColumnByType(tokenType)}`])} 
        WHERE "id" = ${userId} `;

    return result.length
        ? {
              value: result[0].token_value,
              exp: result[0].token_exp,
          }
        : null;
};

export const getTokenByTokenValueAndType = async (tokenValue: string, tokenType: TOKEN_TYPE): Promise<IToken | null> => {
    const result = await sql` SELECT * FROM "users_token" ut
        JOIN "users" u on ut.token_id = ${sql([`u.${getTokenColumnByType(tokenType)}`])}
        WHERE "token_value" = ${tokenValue}; `;

    return result.length
        ? {
              value: result[0].token_value,
              exp: result[0].token_exp,
          }
        : null;
};

export function getTokenColumnByType(tokenType: TOKEN_TYPE) {
    return { registration: 'registration_token_id', forgot_password: 'forgot_password_token_id' }[tokenType];
}
