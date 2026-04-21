const {Router} = require('express');
const cinemasRouter = require('./cinemasRouter/cinemasRouter');
const moviesRouter = require('./moviesRouter/moviesRouter');
const roomsRouter = require('./roomsRouter/roomsRouter');
const showsRouter = require('./showsRouter/showsRouter');
const mainRouter = Router();

mainRouter.get('/health', (req, res) => { res.status(200).json( {message: 'main router working'} ) });

mainRouter.use('/cinemas', cinemasRouter);
mainRouter.use('/movies', moviesRouter);
mainRouter.use('/rooms', roomsRouter);
mainRouter.use('/shows', showsRouter);

module.exports = mainRouter;