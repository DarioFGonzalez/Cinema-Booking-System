const postQueryBuilder = (allowedParams) => (queries) => {
    if(Object.keys(queries).length===0) {
        throw Object.assign( new Error('No se recibió nada por body'),
        {
            status: 400,
            code: 'RECEIVED_AN_EMPTY_BODY',
            timestamp: new Date().toISOString()
        })
    }

    const columns = [];
    const placeholders = [];
    const values = [];

    for(const [key, value] of Object.entries(queries) ) {
        if( allowedParams.includes(key) ) {
            columns.push(key);
            placeholders.push('?');
            values.push(value);
        }
    }

    return { columns, placeholders, values };
}

const updateQueryBuilder = (allowedParams) => (queries) => {
    if(Object.keys(queries).length===0) {
        throw Object.assign( new Error('No se recibió nada por body'),
        {
            status: 400,
            code: 'RECEIVED_AN_EMPTY_BODY',
            timestamp: new Date().toISOString()
        })
    }

    const conditions = [];
    const values = [];

    for(const [key, value] of Object.entries(queries) ) {
        if( allowedParams.includes(key) ) {
            conditions.push(`${key} = ?`);
            values.push(value);
        }
    }

    return { conditions, values };
}

const updateCinemaQuery = updateQueryBuilder([ 'name', 'city', 'is_active' ]);
const updateMoviesQuery = updateQueryBuilder([ 'title', 'duration', 'genre', 'release_date' ]);

const postMovieQuery = (queries) => {
    const mandatoryColumns = [ 'title', 'duration', 'genre' ];
    const missingFields = mandatoryColumns.filter( field => !(field in queries));
    if(missingFields.length>0) {
        throw Object.assign( new Error(`Faltan campos obligatorios: ${missingFields.join(', ')}`),
        {
            status: 400,
            code: 'MISSING_REQUIRED_FIELDS',
            missingFields,
            timestamp: new Date().toISOString()
        })
    }

    const builder = postQueryBuilder([ 'title', 'duration', 'genre', 'release_date' ]);
    return builder(queries);
}

module.exports = {
    updateCinemaQuery, updateMoviesQuery,
    postMovieQuery };