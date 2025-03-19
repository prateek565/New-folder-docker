const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "admin",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "collab_db",
  password: process.env.DB_PASSWORD || "admin",
  port: process.env.DB_PORT || 5432,
});

// Run migrations
const runMigrations = async () => {
  try {
    const migrationSQL = fs.readFileSync(path.join(__dirname, "../migrations/init.sql"), "utf8");
    await pool.query(migrationSQL);
    console.log("✅ Database migration completed successfully.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  }
};

// Execute migration
runMigrations();

module.exports = pool;
