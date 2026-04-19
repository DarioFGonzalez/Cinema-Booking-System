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

const postCinemaQuery = (queries) => {
    const mandatoryColumns = [ 'name', 'city' ];
    const optionalColumns = [ 'is_active' ];
    checkMandatoryColumns(mandatoryColumns, queries);

    const builder = postQueryBuilder([...mandatoryColumns, ...optionalColumns]);
    return builder(queries);
}

const postMovieQuery = (queries) => {
    const mandatoryColumns = [ 'title', 'duration', 'genre' ];
    const optionalColumns = [ 'release_date' ];
    checkMandatoryColumns(mandatoryColumns, queries);

    const builder = postQueryBuilder([ ...mandatoryColumns, ...optionalColumns ]);
    return builder(queries);
}

const postRoomQuery = (queries) => {
    const mandatoryColumns = ['cinema_id', 'capacity'];
    const optionalColumns = [ 'is_active' ];
    checkMandatoryColumns(mandatoryColumns, queries);

    const builder = postQueryBuilder([...mandatoryColumns, ...optionalColumns]);
    return builder(queries);
}

const checkMandatoryColumns = (mandatoryColumns, queries) => {
    const missingFields = mandatoryColumns.filter( field => !(field in queries));
    if(missingFields.length>0) {
        throw Object.assign( new Error(`Faltan campos obligatorios: ${missingFields.join(', ')}`),
        {
            status: 400,
            code: "MISSING_REQUIRED_FIELDS",
            missingFields,
            timestamp: new Date().toISOString()
        })
    }
    return true;
}

module.exports = {
    updateCinemaQuery, updateMoviesQuery,
    postCinemaQuery, postMovieQuery, postRoomQuery };