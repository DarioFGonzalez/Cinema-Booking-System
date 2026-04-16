const postCinema = async (req, res) => {
    const { name, city } = req.body;
    
    try {
        if(!name || !city) {
            throw Object.assign( new Error('Faltan valores necesarios para crear el cinema'),
            {
                status: 400,
                code: "MISSING_KEY_PROPERTIES",
                timestamp: new Date().toISOString()
            })
        }
        
        const createQuery = `
        INSERT INTO cinemas
        (name, city)
        VALUES (?, ?)`

        const [result] = await req.pool.query(createQuery, [name, city]);
        console.log(result);

        return res.status(201).json( {message: 'Cinema creado'} );
    } catch(error) {
        console.error("Error creando cinema:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

module.exports = postCinema;