import postgres from 'postgres';
import { hash } from '/utils/hash_helper.ts';
import { get } from '/config.ts';
import { createUser } from '/repositories/user_repository.ts';
import { UserRole } from '/types/user_model.ts';

const DB_HOST = get('DB_HOST');
const DB_PORT = get('DB_PORT') ?? '';
const DB_DATABASE = get('DB_DATABASE');
const DB_USER = get('DB_USER');
const DB_PASSWORD = get('DB_PASSWORD');
const DEFAULT_ADMIN_EMAIL = get('DEFAULT_ADMIN_EMAIL');
const DEFAULT_ADMIN_PASSWORD = get('DEFAULT_ADMIN_PASSWORD');

if (!DB_HOST || isNaN(+DB_PORT) || !DB_DATABASE || !DB_USER || !DB_PASSWORD) {
    console.error('Invalid DB configuration');
    Deno.exit(3);
}

if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) {
    console.error('Invalid default admin credentials');
    Deno.exit(4);
}

const sql = postgres({
    host: DB_HOST,
    port: +DB_PORT,
    database: DB_DATABASE,
    user: DB_USER,
    password: DB_PASSWORD,
    connection: {
        timezone: 'UTC',
    },
});

await sql`  
  CREATE TABLE IF NOT EXISTS "users" (
    "id"                 BIGSERIAL    PRIMARY KEY,
    "email"              VARCHAR(255) NOT NULL UNIQUE,
    "username"           VARCHAR(64)  NOT NULL,
    "password"           VARCHAR(255) NOT NULL,
    "roles"              VARCHAR(128) NOT NULL,
    "is_active"          BOOLEAN      NOT NULL,
    "registration_token" TEXT         NULL,
    "created_at"         TIMESTAMPTZ  DEFAULT NOW() NOT NULL,
    "updated_at"         TIMESTAMPTZ  DEFAULT NOW() NOT NULL
  );
`;

const createDefaultAdmin = async () => {
    try {
        const hashPassword = await hash(DEFAULT_ADMIN_PASSWORD);
        await createUser(DEFAULT_ADMIN_EMAIL, 'DefaultAdmin', null, hashPassword, [UserRole.USER, UserRole.ADMIN]);
    } catch (err) {
        if (err instanceof postgres.PostgresError && err.message.startsWith('duplicate key')) {
            // Ignore
        } else {
            throw err;
        }
    }
};

export { createDefaultAdmin, sql };
