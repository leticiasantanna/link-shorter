import { sql } from './lib/postgres';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function setup() {
  await sql/* sql */ `CREATE TABLE  IF NOT EXISTS short_link (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE,
  original_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 )`;

  await sql.end();

  console.log('Setup sql feito com sucesso!');
}

void setup();
