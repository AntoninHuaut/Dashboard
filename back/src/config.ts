import { isDocker } from 'isDocker';
import { config as loadEnv } from 'dotenv';

const config = (await isDocker()) ? Deno.env.toObject() : loadEnv();

export default config;
