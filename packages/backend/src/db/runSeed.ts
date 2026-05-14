import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

config({ path: join(__dirname, '..', '..', '..', '..', '.env') });

async function runSeed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const seedFile = join(__dirname, 'seed.sql');
    const sql = readFileSync(seedFile, 'utf-8');

    console.log('Running seed data...');
    await pool.query(sql);
    console.log('✅ Seed data inserted!');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
