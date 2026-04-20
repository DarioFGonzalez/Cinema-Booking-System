const { searchRoomsQuery } = require("../../utils/queryBuilder");

const getAllRooms = async (req, res) => {
    try {
        const [allRooms] = await req.pool.query('SELECT * FROM rooms');

        return res.status(200).json(allRooms);
    } catch(error) {
        console.error("Error buscando todas las salas:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

const getRoomById = async (req, res) => {
    const {id} = req.params;
    try{
        if(!id) {
            throw Object.assign( new Error('ID no recibido'),
            {
                status: 400,
                code: 'NO_ID_RECEIVED',
                timestamp: new Date().toISOString()
            })
        }

        const [row] = await req.pool.query('SELECT id, cinema_id, capacity, is_active FROM rooms WHERE id = ?', [id]);
        if(row.length === 0) {
            throw Object.assign( new Error('Sala no encontrada'),
            {
                status: 404,
                code: 'ROOM_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const statsQuery = `
        SELECT
        SUM(is_active = TRUE) AS active,
        SUM(is_active = FALSE) AS inactive,
        COUNT(*) AS total
        FROM shows
        WHERE room_id = ?`;

        const activeShowsQuery = `
        SELECT
        id, movie_id, show_time
        FROM shows WHERE is_active = TRUE AND room_id = ?`;

        const [stats] = await req.pool.query(statsQuery, [id]);

        const [activeShows] = await req.pool.query(activeShowsQuery, [id]);

        const thisRoom = row[0];

        thisRoom.stats = {
            active_shows: stats[0].active,
            inactive_shows: stats[0].inactive,
            total_shows: stats[0].total
        };

        thisRoom.activeShows = activeShows;

        return res.status(200).json( thisRoom );
    } catch(error) {
        console.error("Error trayendo sala por ID:", error.code||error);
        return res.status(error.status||500).json( { error: error.message||error } );
    }
}

const getRoomsByQuery = async (req, res) => {
    try {
        const {filters, values} = searchRoomsQuery(req.body);
        
        const searchQuery = `SELECT * FROM rooms WHERE ${filters.join(' AND ')}`;

        const [rooms] = await req.pool.query(searchQuery, values);

        return res.status(200).json(rooms);
    } catch(error) {
        console.error("Error buscando salas por query:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

module.exports = {getAllRooms, getRoomById, getRoomsByQuery};