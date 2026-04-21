const { postShowQuery } = require("../../utils/queryBuilder");
const { validateIntegerId } = require("../../utils/validations");

const postShow = async (req, res) => {
    try {
        const { room_id, movie_id } = req.body;
        validateIntegerId( room_id );
        validateIntegerId( movie_id );

        const [room] = await req.pool.query('SELECT id FROM rooms WHERE id = ?', [ room_id ]);
        if(room.length===0) {
            throw Object.assign( new Error('No se encontró la sala a vincular'),
            {
                status: 404,
                code: 'ROOM_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const [movie] = await req.pool.query('SELECT id FROM movies WHERE id = ?', [ movie_id ]);
        if(movie.length===0) {
            throw Object.assign( new Error('No se encontró la película a vincular'),
            {
                status: 404,
                code: 'MOVIE_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const {columns, placeholders, values} = postShowQuery(req.body);

        const postQuery = `INSERT INTO shows (${columns.join(', ')}) VALUES(${placeholders.join(', ')})`;

        const [createShow] = await req.pool.query(postQuery, values);
        if(!createShow.insertId) {
            throw Object.assign( new Error('No se pudo crear el show'),
            {
                status: 500,
                code: 'SHOW_CREATION_FAILED',
                timestamp: new Date().toISOString()
            })
        }

        const [newShow] = await req.pool.query('SELECT * FROM shows WHERE id = ?', [createShow.insertId]);

        return res.status(201).json( newShow[0] );
        
    } catch(error) {
        console.error("Error creando show:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

module.exports = postShow;