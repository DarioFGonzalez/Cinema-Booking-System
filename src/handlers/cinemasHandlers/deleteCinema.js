const { validateId } = require("../../utils/validations");

const deleteCinema = async (req, res) => {
    const {id} = req.params;
    try {
        validateId(id);

        const [result] = await req.pool.query('DELETE FROM cinemas WHERE id = ?', [id]);
        if(result.affectedRows===0) {
            throw Object.assign( new Error('Cinema no encontrado.'),
            {
                status: 404,
                code: 'CINEMA_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        return res.status(204).send();
    } catch(error) {
        console.error("Error borrando cinema:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

module.exports = deleteCinema;