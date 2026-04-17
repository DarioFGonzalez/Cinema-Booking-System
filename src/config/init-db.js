const pool = require('./db');
const crypto = require('crypto');

// ID fijo para el cine de prueba (válido para getById y update)
const FIXED_CINEMA_ID = '11111111-1111-1111-1111-111111111111';

const tables = {
    cinemas: `
        CREATE TABLE IF NOT EXISTS cinemas (
            id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
            name VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `,
    
    movies: `
        CREATE TABLE IF NOT EXISTS movies (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            duration INT NOT NULL,
            genre VARCHAR(255) NOT NULL,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            release_date DATE
        )
    `,
    
    rooms: `
        CREATE TABLE IF NOT EXISTS rooms (
            id INT PRIMARY KEY AUTO_INCREMENT,
            cinema_id CHAR(36) NOT NULL,
            capacity INT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE
        )
    `,
    
    shows: `
        CREATE TABLE IF NOT EXISTS shows (
            id INT PRIMARY KEY AUTO_INCREMENT,
            movie_id INT NOT NULL,
            room_id INT NOT NULL,
            show_time DATETIME NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE RESTRICT,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
        )
    `
};

async function seedTestCinema() {
    try {
        const [existing] = await pool.query(
            'SELECT id FROM cinemas WHERE id = ?',
            [FIXED_CINEMA_ID]
        );
        
        if (existing.length === 0) {
            await pool.query(
                `INSERT INTO cinemas (id, name, city, is_active) 
                 VALUES (?, ?, ?, ?)`,
                [FIXED_CINEMA_ID, 'Cinema de Prueba', 'CABA', true]
            );
        } else {
            console.log('Cine de prueba ya existe');
        }
        // // Opcional: insertar películas de ejemplo si no hay
        // const [movieCount] = await pool.query('SELECT COUNT(*) as count FROM movies');
        // if (movieCount[0].count === 0) {
        //     await pool.query(`
        //         INSERT INTO movies (title, duration, genre, release_date) VALUES 
        //         ('Dune: Parte 2', 166, 'Ciencia ficción', '2024-02-28'),
        //         ('Poor Things', 141, 'Comedia dramática', '2024-01-25'),
        //         ('Oppenheimer', 180, 'Drama histórico', '2023-07-20')
        //     `);
        //     console.log('✅ Películas de ejemplo insertadas');
        // }
        
        // // Opcional: insertar salas de ejemplo para el cine de prueba
        // const [roomCount] = await pool.query(
        //     'SELECT COUNT(*) as count FROM rooms WHERE cinema_id = ?',
        //     [FIXED_CINEMA_ID]
        // );
        // if (roomCount[0].count === 0) {
        //     await pool.query(`
        //         INSERT INTO rooms (cinema_id, capacity, is_active) VALUES 
        //         (?, 100, true),
        //         (?, 80, true),
        //         (?, 120, true)
        //     `, [FIXED_CINEMA_ID, FIXED_CINEMA_ID, FIXED_CINEMA_ID]);
        //     console.log('✅ Salas de ejemplo creadas para el cine de prueba');
        // }
        
    } catch (error) {
        console.warn('Error en seed:', error.message);
    }
}

async function initializeDatabase() {
    try {
        await pool.query(tables.cinemas);
        console.log('Tabla cinemas lista');
        
        await pool.query(tables.movies);
        console.log('Tabla movies lista');
        
        await pool.query(tables.rooms);
        console.log('Tabla rooms lista');
        
        await pool.query(tables.shows);
        console.log('Tabla shows lista');
        
        await seedTestCinema();
        
        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error inicializando DB:', error.message);
        throw error;
    }
}

module.exports = {initializeDatabase, FIXED_CINEMA_ID};
