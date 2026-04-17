const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidUUID = (uuid) => {
    if(!uuid || typeof uuid !== 'string') return false;
    return uuidRegex.test(uuid);
}

const validateId = (id) => {
    if(!id)
    {
        throw Object.assign( new Error('ID no recibido'),
        {
            status: 400,
            code: "NO_ID_RECEIVED",
            timestamp: new Date().toISOString()
        })
    }
    if(!isValidUUID(id))
    {
        throw Object.assign( new Error('Formato del ID inválido'),
        {
            status:400,
            code: "INVALID_ID_FORMAT",
            timestamp: new Date().toISOString()
        })
    }
    return true;
}

module.exports = { validateId };