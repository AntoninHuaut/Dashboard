import postgres from 'postgres';
import { get } from '/config.ts';

const DB_HOST = get('DB_HOST');
const DB_PORT = get('DB_PORT') ?? '';
const DB_DATABASE = get('DB_DATABASE');
const DB_USER = get('DB_USER');
const DB_PASSWORD = get('DB_PASSWORD');

if (!DB_HOST || isNaN(+DB_PORT) || !DB_DATABASE || !DB_USER || !DB_PASSWORD) {
    console.error('Invalid DB configuration');
    Deno.exit(2);
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
  CREATE TABLE IF NOT EXISTS users (
    id         BIGSERIAL    PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    username   VARCHAR(64)  NOT NULL,
    password   VARCHAR(255) NOT NULL,
    roles      VARCHAR(128) NOT NULL,
    is_active  BOOLEAN      NOT NULL,
    created_at TIMESTAMPTZ  DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ  DEFAULT NOW() NOT NULL
  );
`;

export { sql };
