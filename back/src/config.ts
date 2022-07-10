import { isDocker } from 'isDocker';
import { config as loadEnv } from 'dotenv';

const config = (await isDocker()) ? loadEnv() : Deno.env.toObject();
export default config;
