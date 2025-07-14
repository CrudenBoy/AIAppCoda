const fs = require('fs');
require('dotenv').config();

// It's crucial to remove 'sslmode=require' from the DATABASE_URL if it's present,
// as it can interfere with explicit SSL configuration via the 'ssl' object.
// The 'pg' client's 'ssl' object takes precedence when properly configured.
const databaseUrl = process.env.DATABASE_URL.replace('?sslmode=require', '');

console.log("🔐 DB URL (modified for explicit SSL):", databaseUrl);

const { Client } = require('pg');

// Load the DigitalOcean CA certificate.
// This file should be securely stored and accessible to the application.
const caCert = fs.readFileSync('ca-certificate.crt').toString();

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    ca: caCert, // Use the DigitalOcean CA certificate for trusted connection
    rejectUnauthorized: true // Ensure strict validation with the provided CA cert
  },
});

console.log("⚙️ PG Client Config:", client.connectionParameters);

client.connect()
  .then(() => console.log("✅ Connected to DigitalOcean DB"))
  .catch(err => {
    console.error("❌ Failed to connect:", err);
    // Provide more specific hints for common SSL errors
    if (err.code === 'SELF_SIGNED_CERT_IN_CHAIN' || err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      console.error("💡 Hint: This error typically means the CA certificate is missing, incorrect, or not trusted. Ensure 'ca-certificate.crt' is correct and 'sslmode=require' is removed from the DATABASE_URL.");
    } else if (err.code === 'ECONNREFUSED') {
      console.error("💡 Hint: Connection refused. Check database host, port, and firewall rules.");
    }
  });


