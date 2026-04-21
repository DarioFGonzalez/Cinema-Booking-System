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

module.exports = updateShow;