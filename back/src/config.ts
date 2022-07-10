import { isDocker, dotenv } from '../deps.ts';

const config = (await isDocker.isDocker()) ? dotenv.config() : Deno.env.toObject();
export default config;
