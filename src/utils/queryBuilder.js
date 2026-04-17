const updateCinemaQueryBuilder = (queries) => {
    if(Object.keys(queries).length===0) {
        throw Object.assign( new Error('No se recibió nada por body'),
        {
            status: 400,
            code: 'RECEIVED_AN_EMPTY_BODY',
            timestamp: new Date().toISOString()
        })
    }
    const allowedCinemaParams = [ 'name', 'city', 'is_active' ];

    const conditions = [];
    const values = [];

    for(const [key, value] of Object.entries(queries) ) {
        if( allowedCinemaParams.includes(key) ) {
            conditions.push(`${key} = ?`);
            values.push(value);
        }
    }

    return { conditions, values };
}

module.exports = { updateCinemaQueryBuilder };