const {Router} = require('express');
const postMovie = require('../../handlers/moviesHandlers/postMovie');
const { getAllMovies, getMovieById } = require('../../handlers/moviesHandlers/getMovies');
const updateMovie = require('../../handlers/moviesHandlers/updateMovie');
const deleteMovie = require('../../handlers/moviesHandlers/deleteMovie');

const moviesRouter = Router();

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Crea un nuevo registro de pelicula.
 *     description: Creamos un nuevo registro de pelicula enviando sus datos por body.
 *     tags:
 *       - Peliculas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               genre:
 *                 type: string
 *               duration:
 *                 type: integer
 *               release_date:
 *                 type: string
 *                 format: date
 *           examples:
 *               todos_los_datos_necesarios:
 *                 summary: ✔ Enviar todos los datos necesarios.
 *                 description: Si enviamos todos los datos necesarios, el registro se creará con éxito.
 *                 value:
 *                   title: Duro de matar
 *                   genre: Acción
 *                   duration: 132
 *                   release_date: 1988-07-12
 *               faltan_datos_necesarios:
 *                 summary: ✖ No enviar todos los datos necesarios.
 *                 description: Si falta algún dato crítico, recibiremos como respuesta un error.
 *                 value:
 *                   title: Jurassic Park
 *                   genre: Aventura
 *                   release_date: 1993-06-09
 *               enviar_datos_extra:
 *                 summary: ⚠ Todo dato extra será ignorado.
 *                 description: No es la mejor práctica, pero en caso de recibir datos extra estos serán ignorados y se creará el registro con los datos mandatorios.
 *                 value:
 *                   title: Titanic
 *                   genre: Drama
 *                   duration: 194
 *                   release_date: 1997-12-19
 *                   director: James Cameron
 *                   country: Estados Unidos
 *                   budget: 200000000
 *     responses:
 *       201:
 *         description: Pelicula creada exitosamente, devuelve el registro recién creado junto a un código 201.
 *       400:
 *         description: Error en la solicitud. Puede deberse a que recibió un body vacío o faltan campos obligatorios para la creación del registro. En caso de faltar campos obligatorios, se devuelven en el body del error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *                 missingFields:
 *                   type: array
 *                   items:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error interno del servidor
 */

moviesRouter.post('/', postMovie);

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Busca y devuelve todas las peliculas.
 *     description: Busca todas las peliculas en la base de datos y las devuelve en un array.
 *     tags:
 *       - Peliculas
 *     responses:
 *       200:
 *         description: Devuelve un array con todas las peliculas en base de datos.
 *       500:
 *         description: Error interno del servidor
 */

moviesRouter.get('/', getAllMovies);

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Busca una pelicula por ID.
 *     description: Busca específicamente por ID y devuelve todos sus datos junto a los shows a los que esté relacionada.
 *     tags:
 *       - Peliculas
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *         type: string
 *         example: 1
 *        description: ID de la película.
 *     responses:
 *       200:
 *         description: Devuelve un objeto con los datos y shows relacionados a la película buscada.
 *       400:
 *         description: ID recibido con formato inválido.
 *       404:
 *         description: No se encontró una pelicula con esa ID en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

moviesRouter.get('/:id', getMovieById);

/**
 * @swagger
 * /movies/{id}:
 *   patch:
 *     summary: Actualiza los datos no críticos de una pelicula.
 *     description: Actualiza una pelicula, recibe los datos a actualizar por body y el ID de la pelicula por params.
 *     tags:
 *       - Peliculas
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *         type: string
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               duration:
 *                 type: integer
 *               genre:
 *                 type: string
 *               release_date:
 *                 type: string
 *                 format: date
 *           examples:
 *               cambiar_una_propiedad:
 *                 summary: ✔ Cambiar una única propiedad.
 *                 description: Tenemos la opción de cambiar una sola propiedad del registro, siempre y cuando sea válida.
 *                 value:
 *                   title: Dune Part One
 *               cambiar_varias_propiedades:
 *                 summary: ✔ Cambiar mas de una propiedad.
 *                 value:
 *                   title: Dune 3 Overdune
 *                   duration: 100
 *                   genre: Acción
 *                   release_date: 2026-02-02 
 *               enviar_valores_validos_e_invalidos:
 *                 summary: ⚠ Ignora valores inválidos.
 *                 description: Los valores inválidos son ignorados, mientras enviemos algún valor válido por body- el servidor lo tomará y efectuará los cambios. <br>En el ejemplo enviamos un solo valor correcto (title) que será actualizado, mientras los demás serán ignorados.
 *                 value:
 *                   title: Dune 4 Tuna Duna
 *                   budget: 200000000
 *                   directos: Dario Gonzalez
 *                   country: Argentina
 *               enviar_valores_inválidos:
 *                 summary: ✖ Enviar solo valores inválidos.
 *                 description: Enviar solo valores que no son válidos para actualización devolverá un error 400 ("Sin condiciones para actualizar") como respuesta
 *                 value:
 *                   budget: 200000000
 *                   titulo: Dune 5 Duned
 *               enviar_body_vacío:
 *                 summary: ✖ Enviar body vacío.
 *                 description: Al enviar un body vacío, el helper que construye la query de actualización lo detecta y responde con un error 400 ("No se recibió nada por body").
 *                 value: {}
 *     responses:
 *       200:
 *         description: Devuelve el registro completo de la pelicula actualizada.
 *       400:
 *         description: No encontramos datos válidos para cambiar.
 *       404:
 *         description: No se encontró una pelicula con esa ID en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

moviesRouter.patch('/:id', updateMovie);

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Borra el registro entero de la pelicula. [Hard delete]
 *     tags:
 *       - Peliculas
 *     description: Se envía el ID de la pelicula a borrar y se quita permanentemente de la base de datos .
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 2
 *         description: ID de la pelicula a eliminar.
 *     responses:
 *       204:
 *         description: La convención REST dice que ante un DELETE exitoso se devuelve un 204 No Content.
 *       400:
 *         description: No se pudo actualizar correctamente. (ID inválido o no recibido por parametro)
 *       404:
 *         description: No se encontró una pelicula con esa ID en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

moviesRouter.delete('/:id', deleteMovie);

module.exports = moviesRouter;