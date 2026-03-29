const mysql = require('mysql2/promise');
const { db } = require('./env');

const pool = mysql.createPool(db);

/**
 * Test DB Connection
 */
const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = {
  pool,
  testConnection
};