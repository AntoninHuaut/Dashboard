import { ICreateMail, IMail, IMailExtended, IPixelTrack, ITrackMailSettings } from '/types/app/trackmail_model.ts';
import { sql } from '/external/db.ts';
import { createToken } from '/utils/db_helper.ts';

export const getTokenByUserId = async (userId: number): Promise<string | null> => {
    const result = await sql` SELECT "trackmail_token" FROM "app_trackmail" WHERE "user_id" = ${userId}; `;

    return result.length ? result[0].trackmail_token : null;
};

export const getUserIdByToken = async (token: string): Promise<number | null> => {
    const result = await sql` SELECT "user_id" FROM "app_trackmail" WHERE "trackmail_token" = ${token}; `;

    return result.length ? result[0].user_id : null;
};
export const createUserTrackMail = async (userId: number): Promise<string | null> => {
    const result = await sql` INSERT INTO "app_trackmail" ( "user_id", "trackmail_token" ) 
        VALUES ( ${userId}, ${createToken().value} ) 
        RETURNING "trackmail_token"; `;

    return result.length && result[0].trackmail_token ? result[0].trackmail_token : null;
};

export const resetToken = async (userId: number): Promise<string | null> => {
    const result = await sql` UPDATE "app_trackmail" 
        SET "trackmail_token" = ${createToken().value} 
        WHERE "user_id" = ${userId} 
        RETURNING "trackmail_token"; `;

    return result.length && result[0].trackmail_token ? result[0].trackmail_token : null;
};

/* */

export const getSettings = async (userId: number): Promise<ITrackMailSettings | null> => {
    const result = await sql` SELECT "log_email_from", "log_email_to", "log_subject" 
        FROM "app_trackmail"
        WHERE "user_id" = ${userId}; `;

    return result.length ? (result[0] as unknown as ITrackMailSettings) : null;
};

export const updateSettings = async (userId: number, logEmailFrom: boolean, logEmailTo: boolean, logSubject: boolean): Promise<boolean> => {
    const result = await sql` UPDATE "app_trackmail"
        SET "log_email_from" = ${logEmailFrom}, "log_email_to" = ${logEmailTo}, "log_subject" = ${logSubject}
        WHERE "user_id" = ${userId}; `;

    return result.count > 0;
};

/* */

export const insertMail = async (userId: number, body: ICreateMail): Promise<IMail | null> => {
    const result = await sql` INSERT INTO "app_trackmail_mail" ( "user_id", "email_id", "email_from", "email_to", "subject", "created" ) 
        VALUES ( ${userId}, ${createToken().value}, ${body.email_from}, ${body.email_to}, ${body.subject}, ${new Date()} ) 
        RETURNING *; `;

    return result.length > 0 && result[0].email_id ? (result[0] as IMail) : null;
};

export const getMailById = async (emailId: string): Promise<IMail | null> => {
    const result = await sql` SELECT * FROM "app_trackmail_mail" WHERE "email_id" = ${emailId}; `;

    return result.length > 0 ? (result[0] as IMail) : null;
};

export const getMailsCount = async (userId: number): Promise<number> => {
    const result = await sql` SELECT COUNT(*)::int 
        FROM "app_trackmail_mail" 
        WHERE "user_id" = ${userId}; `;

    return result.length ? result[0].count : 0;
};

export const getMails = async (userId: number, page: number, NUMBER_OF_MAILS_PER_PAGE: number): Promise<IMailExtended[]> => {
    const result = await sql` SELECT mail.*, COUNT(log.*)::int as "pixelTrackCount" FROM "app_trackmail_mail" mail 
        JOIN app_trackmail_log log USING("email_id")
        WHERE "user_id" = ${userId}
        GROUP BY "email_id"
        ORDER BY "created" DESC
        LIMIT ${NUMBER_OF_MAILS_PER_PAGE} OFFSET ${page * NUMBER_OF_MAILS_PER_PAGE}; `;

    return result.length > 0 && result[0].email_id ? (result as unknown as IMailExtended[]) : [];
};

/* */

export const pixelTrack = async (emailId: string, userIp: string): Promise<boolean> => {
    const result = await sql` INSERT INTO "app_trackmail_log" ( "email_id", "user_ip", "log_date" ) 
        VALUES ( ${emailId}, ${userIp}, ${new Date()} ); `;

    return result.count > 0;
};

export const getPixelTracksCount = async (email_id: string): Promise<number> => {
    const result = await sql` SELECT COUNT(*)::int 
        FROM "app_trackmail_log" 
        WHERE "email_id" = ${email_id}; `;

    return result.length ? result[0].count : 0;
};

export const getPixelTracks = async (emailId: string, page: number, NUMBER_OF_MAILS_PER_PAGE: number): Promise<IPixelTrack[]> => {
    const result = await sql` SELECT * FROM "app_trackmail_log" 
        WHERE "email_id" = ${emailId}
        ORDER BY "log_date" DESC
        LIMIT ${NUMBER_OF_MAILS_PER_PAGE} OFFSET ${page * NUMBER_OF_MAILS_PER_PAGE}; `;

    return result.length > 0 && result[0].email_id ? (result as unknown as IPixelTrack[]) : [];
};
