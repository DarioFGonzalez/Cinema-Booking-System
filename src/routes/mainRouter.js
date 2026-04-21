const {Router} = require('express');
const demoRouter = require('./demoRouter/demoRouter');
const cinemasRouter = require('./cinemasRouter/cinemasRouter');
const moviesRouter = require('./moviesRouter/moviesRouter');
const roomsRouter = require('./roomsRouter/roomsRouter');
const showsRouter = require('./showsRouter/showsRouter');
const mainRouter = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Ruta para mantener el servidor activo.
 *     description: Usamos esta ruta en conjunto con cron-job para mantener el servidor activo siguiendo un intervalo de request simples cada x minutos.<br><br>Útil para evitar el snooze-time, o tiempo de espera mientras el servidor se levanta de la suspensión por inactividad.
 *     tags:
 *       - 🔧 Mantenimiento
 *     responses:
 *       200:
 *         description: El servidor responde con un mensaje para informar que todavía funciona, evitando el snooze time.<br><br>`message 'main router workin'`
 */

mainRouter.get('/health', (req, res) => { res.status(200).json( {message: 'main router working'} ) });

mainRouter.use('/demo', demoRouter);

mainRouter.use('/cinemas', cinemasRouter);
mainRouter.use('/movies', moviesRouter);
mainRouter.use('/rooms', roomsRouter);
mainRouter.use('/shows', showsRouter);

module.exports = mainRouter;