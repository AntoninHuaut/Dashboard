import { sql } from '/db/db.ts';
import { User, UserRole } from '/types/user_model.ts';

function toUser(user: any) {
    if (!Array.isArray(user.roles)) {
        user.roles = user.roles.split(',');
    }

    return user;
}

const getUsers = async (): Promise<User[]> => {
    const result = await sql`
    SELECT 
      id, email, username, roles, is_active, created_at, updated_at
    FROM users;
    `;

    return result.map((user) => toUser(user));
};

const getUserById = async (id: number): Promise<User | null> => {
    const result = await sql` SELECT id, email, username, roles, is_active, created_at, updated_at
        FROM users WHERE id = ${id};`;

    return result.length ? toUser(result[0]) : null;
};

const getUserByEmail = async (email: string): Promise<User | null> => {
    const result = await sql` SELECT id, email, username, roles, is_active, created_at, updated_at
        FROM users WHERE email = ${email};`;

    return result.length ? toUser(result[0]) : null;
};

const getUserPassword = async (id: number): Promise<string | null> => {
    const result = await sql` SELECT password FROM users WHERE id = ${id}; `;

    return result.length ? result[0].password : null;
};

const createUser = async (email: string, username: string, hashPassword: string, rolesArray: UserRole[]): Promise<User | null> => {
    const rolesStr = rolesArray.join(',');

    const result = await sql`
    INSERT INTO users (
      email, username, password, roles, is_active
    ) VALUES (
        ${email}, ${username}, ${hashPassword}, ${rolesStr}, true
    ) RETURNING id;`;

    return result.length && result[0].id ? await getUserById(result[0].id) : null;
};

const updateUserField = async (id: number, field: string, value: string) => {
    const user = { [field]: value, updated_at: new Date() };

    const result = await sql` UPDATE users SET 
        ${sql(user, field, 'updated_at')}
        WHERE id = ${id};`;

    return result.count > 0;
};

const updateUserPassword = (id: number, hashPassword: string) => {
    return updateUserField(id, 'password', hashPassword);
};

const updateUserEmail = (id: number, email: string) => {
    return updateUserField(id, 'email', email);
};

const updateUserUsername = (id: number, username: string) => {
    return updateUserField(id, 'username', username);
};

const deleteUser = async (id: number) => {
    const result = await sql` DELETE FROM users WHERE id = ${id}; `;

    return result.count > 0;
};

export { createUser, deleteUser, getUserByEmail, getUserById, getUserPassword, getUsers, updateUserPassword, updateUserEmail, updateUserUsername };
