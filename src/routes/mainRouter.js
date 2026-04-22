const {Router} = require('express');
const demoRouter = require('./demoRouter/demoRouter');
const cinemasRouter = require('./cinemasRouter/cinemasRouter');
const moviesRouter = require('./moviesRouter/moviesRouter');
const roomsRouter = require('./roomsRouter/roomsRouter');
const showsRouter = require('./showsRouter/showsRouter');
const mainRouter = Router();

mainRouter.use('/demo', demoRouter);

mainRouter.use('/cinemas', cinemasRouter);
mainRouter.use('/movies', moviesRouter);
mainRouter.use('/rooms', roomsRouter);
mainRouter.use('/shows', showsRouter);

module.exports = mainRouter;