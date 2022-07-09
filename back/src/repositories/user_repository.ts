import { runExecute, runQuery } from "/db/db.ts";
import { User, UserRole } from "/types/user_model.ts";

function toUser(user: any) {
  if (!Array.isArray(user.roles)) {
    user.roles = user.roles.split(",");
  }

  if (Number.isInteger(user.is_active)) {
    user.is_active = user.is_active === 1;
  }

  return user;
}

const getUsers = async (): Promise<User[]> => {
  const result = await runQuery(`
    SELECT 
      id, email, username, roles, is_active, created_at, updated_at
    FROM users;
    `);

  return result.map((user: any) => toUser(user));
};

const getUserById = async (id: number): Promise<User | null> => {
  const result = await runQuery(
    `
    SELECT
      id, email, username, roles, is_active, created_at, updated_at
    FROM users WHERE id = ?;
    `,
    [id],
  );

  return result.length ? toUser(result[0]) : null;
};

const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await runQuery(
    `
    SELECT
      id, email, username, roles, is_active, created_at, updated_at
    FROM users WHERE email = ?;
    `,
    [email],
  );

  return result.length ? toUser(result[0]) : null;
};

const getUserPassword = async (id: number): Promise<string | null> => {
  const result = await runQuery(
    `
    SELECT
      password
    FROM users WHERE id = ?;
    `,
    [id],
  );

  return result.length ? result[0].password : null;
};

const createUser = async (
  email: string,
  username: string,
  hashPassword: string,
  rolesArray: UserRole[],
): Promise<User | null> => {
  const rolesStr = rolesArray.join(",");

  const result = await runExecute(
    `
    INSERT INTO users (
      email, username, password, roles, is_active, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, 1, ?, ?
    );
    `,
    [email, username, hashPassword, rolesStr, new Date(), new Date()],
  );

  return result && result.lastInsertId
    ? await getUserById(result.lastInsertId)
    : null;
};

const updateUser = async (id: number, hashPassword: string) => {
  const result = await runExecute(
    `
    UPDATE users SET
      password = ?,
      updated_at = ?
    WHERE id = ?;
    `,
    [hashPassword, new Date(), id],
  );

  return result && result.affectedRows;
};

const deleteUser = async (id: number) => {
  const result = await runExecute(
    `
    DELETE FROM users
    WHERE id = ?;
    `,
    [id],
  );

  return result && result.affectedRows;
};

export {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  getUserPassword,
  getUsers,
  updateUser,
};
