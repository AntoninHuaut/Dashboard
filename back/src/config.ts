import { config as loadEnv } from 'dotenv';

loadEnv({
    export: true,
    path: `.env.${Deno.env.get('ENV')}`,
});

export const get = (field: string) => Deno.env.get(field);
