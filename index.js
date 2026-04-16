require('dotenv').config({ quiet: true });
const server = require('./src/config/server');
const pool = require('./src/config/db');

async function startServer() {
    try {
        await pool.query('SELECT 1');

        server.listen( process.env.DB_PORT, () => console.log('ok') );
    } catch(error) {
        console.error('Error al iniciar:', error);
        process.exit(1);
    }
}

startServer();