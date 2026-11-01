const mysql = require("mysql2");
require("dotenv").config();

const isCloudSSL =
  process.env.DB_SSL === "true" ||
  Number(process.env.DB_PORT) === 4000 ||
  (process.env.DB_HOST && process.env.DB_HOST.includes("tidbcloud.com"));

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
  database: process.env.DB_NAME || "construction_crm",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: isCloudSSL ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("Database connection failed:", err.message);
  } else {
    console.log("Database connected successfully (Pool active)");
    connection.release();
  }
});

module.exports = db;
