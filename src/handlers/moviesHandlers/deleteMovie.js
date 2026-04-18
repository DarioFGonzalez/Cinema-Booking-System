const deleteMovie = async (req, res) => {
    const {id} = req.params;
    try {
        if(!id) {
            throw Object.assign( new Error('No se recibió ID por params'),
            {
                status: 400,
                code: 'MISSING_MOVIE_ID',
                timestamp: new Date().toisos
            })
        }

        const [result] = await req.pool.query('DELETE FROM movies WHERE id = ?', [id]);
        if(result.affectedRows===0) {
            throw Object.assign( new Error('Pelicula no encontrado.'),
            {
                status: 404,
                code: 'MOVIE_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        return res.status(204).send();
    } catch(error) {
        console.error("Error borrando la pelicula:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

module.exports = deleteMovie;