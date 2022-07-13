import { sql } from '/external/db.ts';
import { User, UserRole } from '/types/user_model.ts';
import { IRegistrationToken } from '/utils/db_helper.ts';

function toUser(user: any) {
    if (!Array.isArray(user.roles)) {
        user.roles = user.roles.split(',');
    }

    return user;
}

const getUsers = async (): Promise<User[]> => {
    const result = await sql`
    SELECT "id", "email", "username", "roles", "is_active", "created_at", "updated_at"
    FROM "users";
    `;

    return result.map((user: any) => toUser(user));
};

const getUserById = async (id: number): Promise<User | null> => {
    const result = await sql` SELECT "id", "email", "username", "roles", "is_active", "created_at", "updated_at"
        FROM "users" WHERE "id" = ${id}; `;

    return result.length ? toUser(result[0]) : null;
};

const getUserByEmail = async (email: string): Promise<User | null> => {
    const result = await sql` SELECT "id", "email", "username", "roles", "is_active", "created_at", "updated_at"
        FROM "users" WHERE "email" = ${email}; `;

    return result.length ? toUser(result[0]) : null;
};

const getUserPassword = async (id: number): Promise<string | null> => {
    const result = await sql` SELECT "password" FROM "users" WHERE "id" = ${id}; `;

    return result.length ? result[0].password : null;
};

const createUser = async (
    email: string,
    username: string,
    registrationToken: IRegistrationToken | null,
    hashPassword: string,
    rolesArray: UserRole[]
): Promise<User | null> => {
    const rolesStr = rolesArray.join(',');
    const { value, exp } = registrationToken !== null ? registrationToken : { value: null, exp: null };
    const isActive = registrationToken === null;

    const result = await sql`
    INSERT INTO "users" (
      "email", "username", "password", "roles", "registration_token", "registration_token_exp", "is_active"
    ) VALUES (
        ${email}, ${username}, ${hashPassword}, ${rolesStr}, ${value}, ${exp}, ${isActive}
    ) RETURNING "id";`;

    return result.length && result[0].id ? await getUserById(result[0].id) : null;
};

const getRegistrationTokenExpDate = async (token: string): Promise<Date | null> => {
    const result = await sql` 
        SELECT "registration_token_exp" FROM "users" WHERE "registration_token" = ${token}; `;

    return result.length ? result[0].registration_token_exp : null;
};

const setVerifiedUser = async (token: string) => {
    const result = await sql`
        UPDATE "users" SET "registration_token" = ${null}, "registration_token_exp" = ${null}, "is_active" = ${true}
        WHERE "registration_token" = ${token};
    `;

    return result.count > 0;
};

const updateUserField = async (id: number, field: string, value: string) => {
    const user = { [field]: value, updated_at: new Date() };

    const result = await sql` UPDATE "users" SET ${sql(user, field, 'updated_at')} WHERE "id" = ${id}; `;

    return result.count > 0;
};

const updateUserPassword = (id: number, hashPassword: string) => {
    return updateUserField(id, `"password"`, hashPassword);
};

const updateUserEmail = (id: number, email: string) => {
    return updateUserField(id, `"email"`, email);
};

const updateUserUsername = (id: number, username: string) => {
    return updateUserField(id, `"username"`, username);
};

const deleteUser = async (id: number) => {
    const result = await sql` DELETE FROM "users" WHERE "id" = ${id}; `;

    return result.count > 0;
};

const deleteUserByRegistrationToken = async (token: string) => {
    const result = await sql` DELETE FROM "users" WHERE "registration_token" = ${token}; `;

    return result.count > 0;
};

export {
    createUser,
    deleteUser,
    deleteUserByRegistrationToken,
    setVerifiedUser,
    getUserByEmail,
    getUserById,
    getUserPassword,
    getRegistrationTokenExpDate,
    getUsers,
    updateUserPassword,
    updateUserEmail,
    updateUserUsername,
};
