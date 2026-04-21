const { updateShowQuery } = require("../../utils/queryBuilder");
const { validateIntegerId } = require("../../utils/validations");

const updateShow = async (req, res) => {
    const {id} = req.params;
    try {
        validateIntegerId(id);

        const { conditions, values } = updateShowQuery(req.body);

        values.push(id);

        const updateQuery = `UPDATE shows SET ${conditions.join(', ')} WHERE id = ?`;

        const [result] = await req.pool.query(updateQuery, values);
        if(result.affectedRows===0) {
            throw Object.assign( new Error('Show no encontrado'),
            {
                status: 404,
                code: "SHOW_NOT_FOUND",
                timestamp: new Date().toISOString()
            })
        }

        const [updatedShow] = await req.pool.query('SELECT * FROM shows WHERE id = ?', [id]);

        return res.status(200).json( updatedShow[0] );
    } catch(error) {
        console.error("Error actualizando show:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

const toggleShow = async (req, res) => {
    const {id} = req.params;
    try {
        validateIntegerId(id);

        const [row] = await req.pool.query('SELECT is_active FROM shows WHERE id = ?', [id]);
        if(row.length === 0) {
            throw Object.assign( new Error('Show no encontrado'),
            {
                status: 404,
                code: 'SHOW_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const newStatus = row.is_active===0?1:0;

        const [result] = await req.pool.query('UPDATE shows SET is_active = ? WHERE id = ?', [newStatus, id]);
        if(result.affectedRows===0) {
            throw Object.assign( new Error('Show no encontrado'),
            {
                status: 404,
                code: 'SHOW_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        return res.status(200).json({message: 'Estado del show cambiado satisfactoriamente'});
    } catch(error) {
        console.error("Error toggle show:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

module.exports = {updateShow, toggleShow};