import postgres from 'postgres';

import { config } from '/config.ts';
import { createUser } from '/repositories/user_repository.ts';
import { UserRole } from '/types/user_model.ts';
import { hash } from '/utils/hash_helper.ts';

const sql = postgres({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    user: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
    connection: {
        timezone: 'UTC',
    },
});

let currentTry = 0;
export async function connect() {
    if (currentTry > 5) {
        console.error('Failed to connect to DB');
        Deno.exit(1);
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
        const hashPassword = await hash(config.DEFAULT_ADMIN_PASSWORD);
        await createUser(config.DEFAULT_ADMIN_EMAIL, 'DefaultAdmin', null, hashPassword, [UserRole.USER, UserRole.ADMIN]);
    } catch (err) {
        if (err instanceof postgres.PostgresError && err.message.startsWith('duplicate key')) {
            // Ignore
        } else {
            throw err;
        }
    }
};

export { createDefaultAdmin, sql };
