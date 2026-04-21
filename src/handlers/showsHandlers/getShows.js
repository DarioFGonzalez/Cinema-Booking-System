const { searchShowsQuery } = require("../../utils/queryBuilder");
const { validateIntegerId } = require("../../utils/validations");

const getAllShows = async (req, res) => {
    try {
        const [allShows] = await req.pool.query('SELECT * FROM shows');

        return res.status(200).json( allShows );
    } catch(error) {
        console.error("Error buscando todos los shows:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

const getShowsByQuery = async (req, res) => {
    try {
        const {filters, values} = searchShowsQuery(req.query);
        
        const searchQuery = `SELECT * FROM shows WHERE ${filters.join(' AND ')}`;

        const [shows] = await req.pool.query(searchQuery, values);

        return res.status(200).json(shows);
    } catch(error) {
        console.error("Error buscando shows por query:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

const getShowById = async (req, res) => {
    const {id} = req.params;
    try{
        validateIntegerId(id);

        const [row] = await req.pool.query('SELECT id, movie_id, room_id, show_time, price, is_active FROM shows WHERE id = ?', [id]);
        if(row.length === 0) {
            throw Object.assign( new Error('Show no encontrado'),
            {
                status: 404,
                code: 'SHOW_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const thisShow = row[0];

        const movieQuery = `SELECT id, title, duration, genre FROM movies WHERE id = ?`;

        const [relatedMovie] = await req.pool.query(movieQuery, [thisShow.movie_id]);

        const roomQuery = `SELECT id, capacity FROM rooms WHERE id = ?`;

        const [relatedRoom] = await req.pool.query(roomQuery, [thisShow.room_id]);

        thisShow.movie = relatedMovie[0];
        thisShow.room = relatedRoom[0];

        delete thisShow.movie_id;
        delete thisShow.room_id;

        return res.status(200).json( thisShow );
    } catch(error) {
        console.error("Error trayendo show por ID:", error.code||error);
        return res.status(error.status||500).json( { error: error.message||error } );
    }
}


module.exports = {getAllShows, getShowsByQuery, getShowById};