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
  CREATE TABLE IF NOT EXISTS "users_token" (
    "token_id"     serial,
    "token_value"  text        not null UNIQUE,
    "token_exp"    timestamptz not null,
    PRIMARY KEY ("token_id")
  );
`;

await sql` 
  CREATE TABLE IF NOT EXISTS "users" (
    "id"                       serial,
    "email"                    varchar(255) not null  UNIQUE,
    "username"                 varchar(64)  not null,
    "password"                 varchar(255) not null,
    "roles"                    varchar(128) not null,
    "is_active"                boolean      not null,
    "created_at"               timestamptz  default now() not null,
    "updated_at"               timestamptz  default now() not null,
    "registration_token_id"    int          null,
    "forgot_password_token_id" int          null,
    PRIMARY KEY ("id"),
    CONSTRAINT users_rti_fk FOREIGN KEY("registration_token_id") REFERENCES users_token("token_id")
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
