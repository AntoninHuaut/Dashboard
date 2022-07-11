import { config as loadEnv } from 'dotenv';

const config = {
    ...Deno.env.toObject(),
    ...loadEnv({
        path: `.env.${Deno.env.get('ENV')}`,
    }),
};

export default config;
