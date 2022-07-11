import { config as loadEnv } from 'dotenv';

const config = { ...Deno.env.toObject(), ...loadEnv() };

export default config;
