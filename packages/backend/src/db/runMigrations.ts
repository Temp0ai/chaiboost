import { config } from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

// Load .env from monorepo root
config({ path: join(__dirname, '..', '..', '..', '..', '.env') });

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const migrationsDir = join(__dirname, 'migrations');
    const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    console.log(`Found ${files.length} migration file(s)`);

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      await pool.query(sql);
      console.log(`  ✅ ${file} done`);
    }

    console.log('All migrations complete!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
