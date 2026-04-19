const { postMovieQuery } = require("../../utils/queryBuilder")

const postMovie = async (req, res) => {
    try {
        const { columns, placeholders, values } = postMovieQuery(req.body);
        const postQuery = `INSERT INTO movies (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

        const [newMovie] = await req.pool.query(postQuery, values);
        if(!newMovie.insertId) {
            throw Object.assign( new Error('No se pudo crear la pelicula'),
            {
                status: 500,
                code: 'MOVIE_CREATION_FAILED',
                timestamp: new Date().toISOString()
            })
        }
        const [row] = await req.pool.query('SELECT * FROM movies WHERE id = ?', [newMovie.insertId]);

        return res.status(201).json(row[0]);
    } catch(error) {
        console.error("Error posteando una pelicula:", error.code||error);
        return res.status(error.status||500).json({ error: error.message||error});
    }
}

module.exports = postMovie;