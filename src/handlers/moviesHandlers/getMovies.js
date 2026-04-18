const { validateId } = require("../../utils/validations");

const getAllMovies = async (req, res) => {
    try {
        const [allMovies] = await req.pool.query('SELECT * FROM movies');
        
        return res.status(200).json( allMovies );
    } catch(error) {
        console.error("Error buscando todas las peliculas:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

const getMovieById = async (req, res) => {
    const { id } = req.params;
    try {
        validateId(id);
        const queryById = `SELECT * FROM movies WHERE id = ?`;

        const [result] = await req.pool.query(queryBiId, [id]);
        if(result.length===0) {
            throw Object.assign( new Error('Pelicula no encontrada'),
            {
                status: 404,
                code: 'MOVIE_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const movie = result[0];

        const getRelatedShowsQuery = `
        SELECT *
        FROM shows
        WHERE movie_id = ?`;

        const [shows] = await req.pool.query(getRelatedShowsQuery, [id]);

        movie.shows = shows;

        return res.status(200).json( movie );
    } catch(error) {
        console.error("Error buscando pelicula por ID:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

module.exports = {getAllMovies, getMovieById};