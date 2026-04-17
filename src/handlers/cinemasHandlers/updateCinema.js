const { updateCinemaQueryBuilder } = require("../../utils/queryBuilder");
const { validateId } = require("../../utils/validations");

const updateCinema = async (req, res) => {
    const { id } = req.params;

    try {
        validateId(id);
        const { conditions, values } = updateCinemaQueryBuilder(req.body);
        if(conditions.length===0) {
            throw Object.assign( new Error('Sin condiciones para actualizar'),
            {
                status: 400,
                code: 'NO_VALID_CONDITIONS_TO_UPDATE',
                timestamp: new Date().toISOString()
            })
        }

        values.push(id);

        const query = `UPDATE cinemas SET ${conditions.join(', ')} WHERE id = ?`;

        const [result] = await req.pool.query( query, values );

        if(result.affectedRows===0)
        {
            throw Object.assign( new Error('Cinema no encontrado'),
            {
                status: 404,
                code: 'CINEMA_NOT_FOUND',
                timestamp: new Date().toISOString()
            } );
        }

        const [rows] = await req.pool.query('SELECT * FROM cinemas WHERE id = ?', [id]);

        return res.status(200).json(rows[0]);
    } catch(error) {
        console.error("Error actualizando cinema:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

const toggleActiveCinema = async (req, res) => {
    const { id } = req.params;
    try {
        validateId(id);
        const [row] = await req.pool.query('SELECT is_active FROM cinemas WHERE id = ?', [id]);
        if(row.length===0) {
            throw Object.assign( new Error('Cinema no encontrado'),
            {
                status: 404,
                code: 'CINEMA_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const newStatus = row[0].is_active===0?1:0;

        const [result] = await req.pool.query('UPDATE cinemas SET is_active = ? WHERE id = ?', [newStatus, id]);
        if(result.affectedRows===0) {
            throw Object.assign(new Error('No se actualizó el estado del cinema'),
            {
                code: 400,
                status: 'COULDNT_UPDATE_STATUS',
                timestamp: new Date().toISOString()
            })
        }

        return res.status(200).json( {message: 'Estado del cinema cambiado satisfactoriamente'} );
    } catch(error) {
        console.error("Error cambiando estado de cinema:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
} 

module.exports = {updateCinema, toggleActiveCinema};