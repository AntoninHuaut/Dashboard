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

let currentTry = 0;
export async function connect() {
    if (currentTry > 5) {
        console.error('Failed to connect to DB');
        Deno.exit(7);
    }

    try {
        console.log('Try to connect to DB, try number: ' + ++currentTry);
        await sql`SELECT 1;`;
    } catch (err) {
        console.error(err);
        console.log('Trying to reconnect to DB in 5 seconds...');

        await new Promise<void>((resolve) =>
            setTimeout(async () => {
                await connect();
                resolve();
            }, 5000)
        );
    }
}

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
