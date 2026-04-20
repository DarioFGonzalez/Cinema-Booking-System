//POST Builders
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

//GET by Query Builders
const getByQueryBuilder = (allowedFilters) => (queries) => {
    if(Object.keys(queries).length===0) {
    throw Object.assign( new Error('No se recibió nada por body'),
        {
            status: 400,
            code: 'RECEIVED_AN_EMPTY_BODY',
            timestamp: new Date().toISOString()
        })
    }

    const filters = [];
    const values = [];

    for(const [key, value] of Object.entries(queries)) {
        if(allowedFilters.includes(key)) {
            filters.push(`${key} = ?`);
            values.push(value);
        }
    }

    if(filters.length===0) {
        throw Object.assign( new Error('Sin filtros válidos'),
        {
            status: 400,
            code: 'NO_VALID_FILTERS_TO_SEARCH',
            timestamp: new Date().toISOString()
        })
    }

    return { filters, values };
}

const searchRoomsQuery = getByQueryBuilder(['cinema_id', 'capacity', 'is_active']);

//UPDATE Builders
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

    if(conditions.length===0) {
        throw Object.assign( new Error('Sin condiciones para actualizar'),
        {
            status: 400,
            code: 'NO_VALID_CONDITIONS_TO_UPDATE',
            timestamp: new Date().toISOString()
        })
    }

    return { conditions, values };
}

const updateCinemaQuery = updateQueryBuilder([ 'name', 'city', 'is_active' ]);
const updateMoviesQuery = updateQueryBuilder([ 'title', 'duration', 'genre', 'release_date' ]);
const updateRoomQuery = updateQueryBuilder([ 'capacity', 'is_active' ]);

//Helpers
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
    updateCinemaQuery, updateMoviesQuery, updateRoomQuery,
    searchRoomsQuery,
    postCinemaQuery, postMovieQuery, postRoomQuery };