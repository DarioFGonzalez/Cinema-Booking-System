const { postCinemaQuery } = require("../../utils/queryBuilder");

const postCinema = async (req, res) => {
    try {
        const { columns, placeholders, values } = postCinemaQuery(req.body);

        const createQuery = `INSERT INTO cinemas (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

        await req.pool.query(createQuery, values);
        const [row] = await req.pool.query('SELECT * FROM cinemas WHERE name = ?', req.body.name);

        return res.status(201).json(row[0]);
    } catch(error) {
        console.error("Error creando cinema:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

module.exports = postCinema;