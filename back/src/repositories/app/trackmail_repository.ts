import { sql } from '/external/db.ts';

function generateToken() {
    return `${crypto.randomUUID()}-${crypto.randomUUID()}`;
}

export const getTokenByUserId = async (userId: number): Promise<string | null> => {
    const result = await sql` SELECT "trackmail_token" FROM "app_trackmail" WHERE "user_id" = ${userId}; `;

    return result.length ? result[0].trackmail_token : null;
};

export const insertTokenForUserId = async (userId: number): Promise<string | null> => {
    const result = await sql` INSERT INTO "app_trackmail" ( "user_id", "trackmail_token" ) 
        VALUES ( ${userId}, ${generateToken()} ) 
        RETURNING "trackmail_token"; `;

    return result.length && result[0].trackmail_token ? result[0].trackmail_token : null;
};

export const resetTokenByUserId = async (userId: number): Promise<string | null> => {
    const result = await sql` UPDATE "app_trackmail" 
        SET "trackmail_token" = ${generateToken()} 
        WHERE "user_id" = ${userId} 
        RETURNING "trackmail_token"; `;

    return result.length && result[0].trackmail_token ? result[0].trackmail_token : null;
};
