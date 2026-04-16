const express = require('express');
const server = express();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const cors = require('cors');
const pool = require('./db');
const mainRouter = require('../routes/mainRouter');

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