const { validateIntegerId } = require("../../utils/validations");

const deleteRoom = async (req, res) => {
    const {id} = req.params;
    try {
        validateIntegerId(id);

        const [result] = await req.pool.query('DELETE FROM rooms WHERE id = ?', [id]);
        if(result.affectedRows===0) {
            throw Object.assign( new Error('No se borró el registro de la sala'),
            {
                status: 400,
                code: 'COULDNT_DELETE_ROOM',
                timestamp: new Date().toISOString()
            })
        }

        return res.status(204).send()
    } catch(error) {
        console.error("Error eliminando sala:", error.code||error);
        return res.status(error.status||500).json({error: error.mesage||error});
    }
}

module.exports = deleteRoom;