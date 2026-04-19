const { postRoomQuery } = require("../../utils/queryBuilder");
const { validateId } = require("../../utils/validations");

const postRoom = async (req, res) => {
    try {
        const { cinema_id } = req.body
        validateId(cinema_id);

        const [cinema] = await req.pool.query('SELECT id FROM cinemas WHERE id = ?', [cinema_id]);
        if(cinema.length===0) {
            throw Object.assign( new Error('Cinema no encontrado'),
            {
                status: 404,
                code: 'CINEMA_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const { columns, placeholders, values } = postRoomQuery(req.body);

        const postQuery = `INSERT INTO rooms (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`

        const [newRoom] = await req.pool.query(postQuery, values);
        if(!newRoom.insertId) {
            throw Object.assign( new Error('No se pudo crear la sala'),
            {
                status: 500,
                code: 'ROOM_CREATION_FAILED',
                timestamp: new Date().toISOString()
            })
        }

        const [row] = await req.pool.query('SELECT * FROM rooms WHERE id = ?', [newRoom.insertId]);

        return res.status(201).json(row[0]);
    } catch(error) {
        console.error("Error creando sala:", error.code||error);
        return res.status(error.status||500).json( { error: error.message||error } );
    }
}

module.exports = postRoom;