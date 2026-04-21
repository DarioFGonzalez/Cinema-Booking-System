const { validateIntegerId } = require("../../utils/validations");

const deleteShow = async (req, res) => {
    const {id} = req.params;
    try {
        validateIntegerId(id);

        const deleteQuery = `DELETE FROM shows WHERE id = ?`;

        const [result] = await req.pool.query(deleteQuery, id);
        if(result.affectedRows===0) {
            throw Object.assign( new Error('Show no encontrado'),
            {
                status: 404,
                code: 'SHOW_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        return res.status(204).send();
    } catch(error) {
        console.error("Error eliminando show:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

module.exports = deleteShow;