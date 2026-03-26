const mysql = require("mysql2/promise");

let pool;

async function connectDB() {
  pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "golf_charity_platform",
    waitForConnections: true,
    connectionLimit: 10
  });

  await pool.query("SELECT 1");
  console.log("MySQL connected");
}

function getDB() {
  if (!pool) throw new Error("Database pool is not initialized");
  return pool;
}

module.exports = connectDB;
module.exports.getDB = getDB;
