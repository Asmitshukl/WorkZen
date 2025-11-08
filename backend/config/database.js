const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false 
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, 
});

pool.on('connect', () => {
  console.log('PostgreSQL connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err.message);
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { 
        text: text.substring(0, 100) + '...', 
        duration: duration + 'ms', 
        rows: res.rowCount 
      });
    }
    return res;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
};

const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Cleanup old OTPs every hour
setInterval(async () => {
  try {
    const result = await query('DELETE FROM otps WHERE expires_at < NOW()');
    console.log(`Cleaned up ${result.rowCount} expired OTPs`);
  } catch (error) {
    console.error('Error cleaning up OTPs:', error.message);
  }
}, 60 * 60 * 1000);

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection test failed:', err.message);
    console.log('Check your DATABASE_URL in .env file');
  } else {
    console.log('Database connection test successful');
    console.log('Database time:', res.rows[0].now);
  }
});

module.exports = {
  pool,
  query,
  transaction
};