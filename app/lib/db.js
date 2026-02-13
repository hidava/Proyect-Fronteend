import mysql from 'mysql2/promise';

// Reusar el pool durante HMR para evitar múltiples conexiones en desarrollo
let pool;
if (!global.__MYSQL_POOL) {
  global.__MYSQL_POOL = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'usuarios_db',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

pool = global.__MYSQL_POOL;

export default pool;
