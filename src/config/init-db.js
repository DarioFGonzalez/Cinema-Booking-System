const pool = require('./db');

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
        await pool.query(`
            INSERT INTO cinemas (id, name, city, is_active) 
            VALUES (?, 'Cinema de Prueba', 'CABA', true)
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                city = VALUES(city),
                is_active = VALUES(is_active)
        `, [FIXED_CINEMA_ID]);

        const fixedDateTime = '2026-04-21 16:45:00';

        const moviesSeed = [
            [1, 'Dune: Parte 2', 166, 'Ciencia ficción', '2024-02-28', fixedDateTime],
            [2, 'Poor Things', 141, 'Comedia dramática', '2024-01-25', fixedDateTime],
            [3, 'Oppenheimer', 180, 'Drama histórico', '2023-07-20', fixedDateTime]
        ];

        const moviePlaceholders = moviesSeed.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const movieFlatValues = moviesSeed.flat();

        await pool.query(`
            INSERT INTO movies (id, title, duration, genre, release_date, added_at) 
            VALUES ${moviePlaceholders}
            ON DUPLICATE KEY UPDATE 
                title = VALUES(title),
                duration = VALUES(duration),
                genre = VALUES(genre),
                release_date = VALUES(release_date),
                added_at = VALUES(added_at)
        `, movieFlatValues);

        const roomsSeed = [
            [1, FIXED_CINEMA_ID, 100, true],
            [2, FIXED_CINEMA_ID, 80, true],
            [3, FIXED_CINEMA_ID, 120, true]
        ];

        const roomsPlaceholders = roomsSeed.map(() => '(?, ?, ?, ?)').join(', ');
        const roomsFlatValues = roomsSeed.flat();

        await pool.query(`
            INSERT INTO rooms (id, cinema_id, capacity, is_active) 
            VALUES ${roomsPlaceholders}
            ON DUPLICATE KEY UPDATE 
                capacity = VALUES(capacity),
                is_active = VALUES(is_active)
        `, roomsFlatValues);

        const showsSeed = [
            [1, 1, 1, '2026-04-21 18:00:00', 7500.00, true],
            [2, 2, 1, '2026-04-21 20:30:00', 8500.00, true],
            [3, 3, 2, '2026-04-22 19:00:00', 9200.50, true]
        ];

        const showsPlaceholders = showsSeed.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const showsFlatValues = showsSeed.flat();

        await pool.query(`
            INSERT INTO shows (id, movie_id, room_id, show_time, price, is_active) 
            VALUES ${showsPlaceholders}
            ON DUPLICATE KEY UPDATE 
                movie_id = VALUES(movie_id),
                room_id = VALUES(room_id),
                show_time = VALUES(show_time),
                price = VALUES(price),
                is_active = VALUES(is_active)
        `, showsFlatValues);

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

module.exports = { initializeDatabase };