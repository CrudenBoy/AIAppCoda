// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for connecting to DigitalOcean databases
  },
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  // FIX: Export the pool object so server.js can access it for transactions.
  pool: pool,
};