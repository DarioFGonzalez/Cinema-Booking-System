const { searchCinemasQuery } = require("../../utils/queryBuilder");
const { validateId } = require("../../utils/validations");

const getAllCinemas = async (req, res) => {
    try {
        const getAllQuery = `
        SELECT *
        FROM cinemas`;

        const [rows] = await req.pool.query(getAllQuery);

        return res.status(200).json(rows);
    } catch(error) {
        console.error("Error trayendo todos los cinemas:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error});
    }
}

const getCinemasByQuery = async (req, res) => {
    try {
        const {filters, values} = searchCinemasQuery(req.query);
        
        const searchQuery = `SELECT * FROM cinemas WHERE ${filters.join(' AND ')}`;

        const [cinemas] = await req.pool.query(searchQuery, values);

        return res.status(200).json(cinemas);
    } catch(error) {
        console.error("Error buscando cinemas por query:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

const getCinemaById = async (req, res) => {
    const { id } = req.params;
    try {
        validateId(id);

        const getByIdQuery = `
        SELECT *
        FROM cinemas
        WHERE id = ?`;

        const [row] = await req.pool.query( getByIdQuery, [ id ] );
        if(row.length===0) {
            throw Object.assign( new Error('Cinema con ese ID no encontrado.'),
            {
                status: 404,
                code: 'CINEMA_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const thisCinema = row[0];

        const getRelatedRoomsQuery= `
        SELECT id, capacity, is_active
        FROM rooms
        WHERE cinema_id = ?`;

        const [rooms] = await req.pool.query(getRelatedRoomsQuery, [id]);
        
        thisCinema.rooms = rooms;

        return res.status(200).json( thisCinema );
    } catch(error) {
        console.error("Error buscando cinema por ID:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

module.exports = { getAllCinemas, getCinemasByQuery, getCinemaById };