import { deleteToken, getTokenByTokenTypeAndUserId, getTokenColumnByType, insertToken, TOKEN_TYPE } from './user_token_repository.ts';
import { sql } from '/external/db.ts';
import { User, UserRole } from '/types/user_model.ts';
import { IToken } from '/utils/db_helper.ts';

function toUser(user: any) {
    if (!Array.isArray(user.roles)) {
        user.roles = user.roles.split(',');
    }

    return user;
}

export const getUsers = async (): Promise<User[]> => {
    const result = await sql`
    SELECT "id", "email", "username", "roles", "is_active", "created_at", "updated_at"
    FROM "users";
    `;

    return result.map((user: any) => toUser(user));
};

export const getUserById = async (id: number): Promise<User | null> => {
    const result = await sql` SELECT "id", "email", "username", "roles", "is_active", "created_at", "updated_at"
        FROM "users" WHERE "id" = ${id}; `;

    return result.length ? toUser(result[0]) : null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    const result = await sql` SELECT "id", "email", "username", "roles", "is_active", "created_at", "updated_at"
        FROM "users" WHERE "email" = ${email}; `;

    return result.length ? toUser(result[0]) : null;
};

export const getUserPassword = async (id: number): Promise<string | null> => {
    const result = await sql` SELECT "password" FROM "users" WHERE "id" = ${id}; `;

    return result.length ? result[0].password : null;
};

export const createUser = async (
    email: string,
    username: string,
    registrationToken: IToken | null,
    hashPassword: string,
    rolesArray: UserRole[]
): Promise<User | null> => {
    const rolesStr = rolesArray.join(',');
    const { value, exp } = registrationToken !== null ? registrationToken : { value: null, exp: null };
    const isActive = registrationToken === null;

    let insertedTokenId = null;
    if (value) {
        insertedTokenId = await insertToken(value, exp);
        if (!insertedTokenId) return null;
    }

    const result = await sql`
    INSERT INTO "users" (
      "email", "username", "password", "roles", "registration_token_id", "is_active"
    ) VALUES (
        ${email}, ${username}, ${hashPassword}, ${rolesStr}, ${insertedTokenId}, ${isActive}
    ) RETURNING "id";`;

    return result.length && result[0].id ? await getUserById(result[0].id) : null;
};

export const setVerifiedUser = async (userId: number, tokenValue: string): Promise<boolean> => {
    const isTokenRemoved = await removeUserTokenId(userId, tokenValue, 'registration');

    if (isTokenRemoved) {
        return await updateUserField(userId, `is_active`, true);
    }

    return false;
};

export const setResetPassword = async (userId: number, tokenValue: string, hashPassword: string): Promise<boolean> => {
    const isTokenRemoved = await removeUserTokenId(userId, tokenValue, 'forgot_password');

    if (isTokenRemoved) {
        return await updateUserField(userId, `password`, hashPassword);
    }

    return false;
};

export const setForgotPasswordToken = async (userId: number, forgotPasswordToken: IToken): Promise<boolean> => {
    const existingForgotPasswordToken = await getTokenByTokenTypeAndUserId(userId, 'forgot_password');
    if (existingForgotPasswordToken) {
        await removeUserTokenId(userId, existingForgotPasswordToken.value, 'forgot_password');
    }

    const insertedTokenId = await insertToken(forgotPasswordToken.value, forgotPasswordToken.exp);
    if (insertedTokenId) {
        return await updateUserField(userId, `forgot_password_token_id`, insertedTokenId);
    }

    return false;
};

export const getUserIdByTokenValueAndType = async (tokenValue: string, tokenType: TOKEN_TYPE): Promise<number | null> => {
    const result = await sql` SELECT id FROM "users" u
        JOIN "users_token" ut on ut.token_id = ${sql([`u.${getTokenColumnByType(tokenType)}`])}
        WHERE "token_value" = ${tokenValue}; `;

    return result.length ? result[0].id : null;
};

export const removeUserTokenId = async (userId: number, tokenValue: string, tokenType: TOKEN_TYPE): Promise<boolean> => {
    const res1 = await updateUserField(userId, `${getTokenColumnByType(tokenType)}`, null);
    const res2 = await deleteToken(tokenValue);

    return res1 && res2;
};

const updateUserField = async (id: number, field: string, value: string | number | boolean | null): Promise<boolean> => {
    const user = { [field]: value, updated_at: new Date() };

    const result = await sql` UPDATE "users" SET ${sql(user, field, 'updated_at')} WHERE "id" = ${id}; `;

    return result.count > 0;
};

export const updateUserPassword = (id: number, hashPassword: string): Promise<boolean> => {
    return updateUserField(id, `password`, hashPassword);
};

export const updateUserEmail = (id: number, email: string): Promise<boolean> => {
    return updateUserField(id, `email`, email);
};

export const updateUserUsername = (id: number, username: string): Promise<boolean> => {
    return updateUserField(id, `username`, username);
};

export const deleteUser = async (id: number): Promise<boolean> => {
    const result = await sql` DELETE FROM "users" WHERE "id" = ${id}; `;

    return result.count > 0;
};
