const {Router} = require('express');
const postCinema = require('../handlers/postCinema');
const mainRouter = Router();

mainRouter.get('/health', (req, res) => { res.status(200).json( {message: 'main router working'} ) });

/**
 * @swagger
 * /cinemas:
 *   post:
 *     summary: Crea un nuevo cinema
 *     description: Enviamos datos básicos para crear un nuevo Cinema en la base de datos..
 *     tags:
 *       -  creación
 *       -  admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cine caballito
 *               city:
 *                 type: string
 *                 example: Caballito
 *     responses:
 *       201:
 *         description: Cinema creado exitosamente
 *       400:
 *         description: Datos inválidos o faltantes
 *       500:
 *         description: Error interno del servidor
 */

mainRouter.post('/cinemas', postCinema);

module.exports = mainRouter;