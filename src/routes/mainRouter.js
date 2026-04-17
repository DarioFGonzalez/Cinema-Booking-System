const {Router} = require('express');
const cinemasRouter = require('./cinemasRouter/cinemasRouter');
const mainRouter = Router();

mainRouter.get('/health', (req, res) => { res.status(200).json( {message: 'main router working'} ) });

mainRouter.use('/cinemas', cinemasRouter);


module.exports = mainRouter;