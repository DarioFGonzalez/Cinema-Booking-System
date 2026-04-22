require('dotenv').config({ quiet: true });
const server = require('./src/config/server');
const pool = require('./src/config/db');
const { initializeDatabase } = require('./src/config/init-db');

async function startServer() {
    try {
        await pool.query('SELECT 1');

        await initializeDatabase();

        const PORT = process.env.PORT || 5000;

        server.listen( PORT, () => console.log(`Server running on port ${PORT}`) );
    } catch(error) {
        console.error('Error al iniciar:', error);
        process.exit(1);
    }
}

startServer();