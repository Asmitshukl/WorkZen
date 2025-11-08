// Load environment variables from parent directory
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fs = require('fs');
const { Pool } = require('pg');


console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Loaded' : '✗ Missing');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env file');
  console.error('Current directory:', __dirname);
  console.error('Looking for .env at:', path.join(__dirname, '../.env'));
  process.exit(1);
}

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function runMigrations() {
  try {
    console.log('Starting database migration...');
    console.log('Connecting to database...');

    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    console.log('Database time:', testResult.rows[0].now);

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log('Reading schema from:', schemaPath);
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('Schema file loaded, executing SQL...');

    // Execute schema
    await pool.query(schema);

    console.log('Database migration completed successfully!');
    console.log('All tables created');
    
    // List created tables
    const tables = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log('\n📋 Created tables:');
    tables.rows.forEach(row => {
      console.log('   ✓', row.tablename);
    });

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error('Error details:', error);
    await pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };