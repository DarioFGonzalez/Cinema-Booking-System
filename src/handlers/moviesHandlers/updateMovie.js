const { updateMoviesQuery } = require("../../utils/queryBuilder");
const { validateId } = require("../../utils/validations");

const updateMovie = async (req, res) => {
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
        
        const { conditions, values } = updateMoviesQuery(req.body);
        if(conditions.length===0) {
            throw Object.assign( new Error('Sin condiciones para actualizar'),
            {
                status: 400,
                code: 'NO_VALID_CONDITIONS_TO_UPDATE',
                timestamp: new Date().toISOString()
            })
        }

        values.push(id);

        const updateQuery = `UPDATE movies SET ${conditions.join(', ')} WHERE id = ?`;

        const [result] = await req.pool.query(updateQuery, values);
        if(result.affectedRows===0) {
            throw Object.assign( new Error('Pelicula no encontrada'),
            {
                status: 404,
                code: 'MOVIE_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const [row] = await req.pool.query('SELECT * FROM movies WHERE id = ?', [id]);
        
        return res.status(200).json(row[0]);
    } catch(error) {
        console.error("Error actualizando esta pelicula:", error.code||error);
        return res.status(error.status||500).json({error: error.message||error});
    }
}

module.exports = updateMovie;