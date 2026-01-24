const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('connect', () => {
  console.log('connected to the postgres database✅');
});
pool.on('error', (err) => {
  console.error('error connecting to the database', err);
});

module.exports = pool;