import { isDocker, dotenv } from '../deps.ts';

const config = (await isDocker.isDocker()) ? Deno.env.toObject() : dotenv.config();

export default config;
