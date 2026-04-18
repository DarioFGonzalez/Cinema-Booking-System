const { postMovieQuery } = require("../../utils/queryBuilder")

const postMovie = async (req, res) => {
    try {
        const { columns, placeholders, values } = postMovieQuery(req.body);
        const postQuery = `INSERT INTO movies (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

        const [newMovie] = await req.pool.query(postQuery, values);
        const [row] = await req.pool.query('SELECT * FROM movies WHERE id = ?', [newMovie.insertId]);

        return res.status(201).json(row[0]);
    } catch(error) {
        console.error("Error posteando una pelicula:", error.code||error);
        return res.status(error.status||500).json({ error: error.message||error});
    }
}

module.exports = postMovie;