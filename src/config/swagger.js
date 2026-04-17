const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Cinema API',
            version: '1.0.0',
            description: 'API para gestión de cines, peliculas, salas y funciones.',
            contact: {
                name: 'Dario Fernando Gonzalez',
                email: 'dario.zerobyte@gmail.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Servidor local'
            }
        ],
        components: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    apis: ['./src/routes/**/*.js', './src/handlers/*.js']
};

module.exports = swaggerJSDoc(options);