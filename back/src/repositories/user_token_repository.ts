import { sql } from '/external/db.ts';

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
