import { Client, configLogger, ExecuteResult } from "mysql";
import config from "/config.ts";

const { DB_HOST, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD } = config;

if (!DB_HOST || isNaN(+DB_PORT) || !DB_DATABASE || !DB_USER || !DB_PASSWORD) {
  console.error("Invalid DB configuration");
  Deno.exit(2);
}

configLogger({
  level: "WARNING",
});

runQuery(`  
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER  NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(64) NOT NULL,
    password VARCHAR(255) NOT NULL,
    roles VARCHAR(128) NOT NULL,
    is_active TINYINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`);

function getClient() {
  return new Client().connect({
    port: +DB_PORT,
    hostname: DB_HOST,
    db: DB_DATABASE,
    username: DB_USER,
    password: DB_PASSWORD,
  });
}

async function run(func: (client: Client) => Promise<any | null>) {
  const client = await getClient();
  try {
    return await func(client);
  } catch (err) {
    throw err;
  } finally {
    client.close();
  }
}

async function runQuery(query: string, args?: any[]): Promise<any | null> {
  return await run(async (client) => await client.query(query, args));
}

async function runExecute(
  query: string,
  args?: any[],
): Promise<ExecuteResult | null> {
  return await run(async (client) => await client.execute(query, args));
}

export { runExecute, runQuery };
