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

        const [stats] = await req.pool.query(statsQuery, [id]);

        const thisRoom = row[0];

        thisRoom.stats = {
            active_shows: stats[0].active,
            inactive_shows: stats[0].inactive,
            total_shows: stats[0].total
        };

        return res.status(200).json( thisRoom );
    } catch(error) {
        console.error("Error trayendo sala por ID:", error.code||error);
        return res.status(error.status||500).json( { error: error.message||error } );
    }
}

const getRoomShowsByStatus = async (req, res) => {
    const { status } = req.query;
    const { id } = req.params;
    try {
        if(!id) {
        throw Object.assign( new Error('ID no recibido'),
        {
            status: 400,
            code: 'NO_ID_RECEIVED',
            timestamp: new Date().toISOString()
        })
        }
        if(!status) {
            throw Object.assign( new Error('No se recibió parametro de búsqueda'),
            {
                status: 400,
                code: 'MISSING_SEARCH_PARAMETERS',
                timestamp: new Date().toISOString()
            })
        }

        const [thisRoom] = await req.pool.query('SELECT id FROM rooms WHERE id = ?', [id]);
        if(thisRoom.length===0) {
            throw Object.assign( new Error('Sala no encontrada'),
            {
                status: 404,
                code: 'ROOM_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }
        
        const is_active = status==='active' ? 'TRUE' : status === 'inactive' ? 'FALSE' : null;
        if(is_active===null) {
            throw Object.assign( new Error('Parámetro de búsqueda inválido.'),
            {
                status: 400,
                code: 'INVALID_SEARCH_PARAMETER',
                timestamp: new Date().toISOString()
            })
        }

        const byStatusQuery = `SELECT * FROM shows WHERE is_active = ? AND room_id = ?`;

        const [statusShows] = await req.pool.query(byStatusQuery, [is_active, id]);
        return res.status(200).json(statusShows);
    } catch(error) {
        console.error("Error trayendo shows por status:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

module.exports = {getAllRooms, getRoomById, getRoomShowsByStatus};