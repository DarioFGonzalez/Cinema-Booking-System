const express = require('express');
const server = express();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const cors = require('cors');
const pool = require('./db');
const mainRouter = require('../routes/mainRouter');

console.log('🔍 DEBUG - NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 DEBUG - DB_HOST_PROD existe?', !!process.env.DB_HOST_PROD);
console.log('🔍 DEBUG - DB_HOST_PROD valor:', process.env.DB_HOST_PROD);

server.use(cors())
server.use(express.json());

server.use( (req, res, next) => {
    req.pool = pool;
    next();
});

server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

server.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'appication/json');
    res.send(swaggerSpec);
});

server.use(mainRouter);

module.exports = server;