const { updateRoomQuery } = require("../../utils/queryBuilder");
const { validateIntegerId } = require("../../utils/validations");

const updateRoom = async(req, res) => {
    const {id} = req.params;
    try {
        validateIntegerId(id);

        const { conditions, values } = updateRoomQuery(req.body);

        values.push(id);

        const updateQuery = `UPDATE rooms SET ${conditions.join(', ')} WHERE id = ?`;

        const [result] = await req.pool.query(updateQuery, values);
        if(result.affectedRows===0) {
            throw Object.assign( new Error('Sala no encontrada'),
            {
                status: 404,
                code: "ROOM_NOT_FOUND",
                timestamp: new Date().toISOString()
            })
        }

        const [updatedRoom] = await req.pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
        
        return res.status(200).json(updatedRoom[0]);

    } catch(error) {
        consol.error("Error actualizando sala:", error.code||error);
        return res.status(error.status).json({error: error.message||error});
    }
}

const toggleRoom = async (req, res) => {
    const {id} = req.params;
    try {
        validateIntegerId(id);

        const [row] = await req.pool.query('SELECT is_active FROM rooms WHERE id = ?', [id]);
        if(row.length === 0) {
            throw Object.assign( new Error('Sala no encontrada'),
            {
                status: 404,
                code: 'ROOM_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const newStatus = row.is_active===0?1:0;

        const [result] = await req.pool.query('UPDATE rooms SET is_active = ? WHERE id = ?', [newStatus, id]);
        if(result.affectedRows===0) {
            throw Object.assign( new Error('Sala no encontrada'),
            {
                status: 404,
                code: 'ROOM_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        return res.status(200).json({message: 'Estado de la sala cambiado satisfactoriamente'});
    } catch(error) {
        console.error("Error toggle room:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

module.exports = {updateRoom, toggleRoom};