const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

if (process.env.NODE_ENV === 'production') {
    pool = mysql.createPool({
        host: process.env.DB_HOST_PROD,
        user: process.env.DB_USER_PROD,
        password: process.env.DB_PASSWORD_PROD,
        database: process.env.DB_NAME_PROD,
        port: parseInt(process.env.DB_PORT_PROD),
        ssl: { rejectUnauthorized: false }
    });
} else {
    pool = mysql.createPool({
        host: process.env.DB_HOST_LOCAL,
        user: process.env.DB_USER_LOCAL,
        password: process.env.DB_PASSWORD_LOCAL,
        database: process.env.DB_NAME_LOCAL,
        port: parseInt(process.env.DB_PORT_LOCAL) || 3306
    });
}

module.exports = pool;