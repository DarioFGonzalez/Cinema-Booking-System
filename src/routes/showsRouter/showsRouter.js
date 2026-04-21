const {Router} = require('express');
const postShow = require('../../handlers/showsHandlers/postShow');
const { getAllShows, getShowsByQuery, getShowById } = require('../../handlers/showsHandlers/getShows');
const updateShow = require('../../handlers/showsHandlers/updateShow');
const deleteShow = require('../../handlers/showsHandlers/deleteShow');
const showsRouter = Router();

/**
 * @swagger
 * /shows:
 *   post:
 *     summary: Crea un nuevo registro de show.
 *     description: Crea un nuevo show con los datos enviados, se la relaciona inmediatamente con la peliculal y la sala en la que ocurre.
 *     tags:
 *       - Shows
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movie_id
 *               - room_id
 *               - show_time
 *               - price
 *             properties:
 *               movie_id:
 *                 type: integer
 *                 description: ID de la película que se va a proyectar.
 *               room_id:
 *                 type: integer
 *                 description: ID de la sala donde se proyectará la película.
 *               show_time:
 *                 type: string
 *                 format: date-time
 *               price:
 *                 type: number
 *                 format: double
 *                 description: Precio de la entrada al show. (Acepta decimales)
 *               is_active:
 *                 type: boolean
 *                 description: Estado inicial del show (1) activo (0) inactivo.
 *           examples:
 *               solo_datos_necesarios:
 *                 summary: ✔ Enviamos solo datos necesarios.
 *                 description: Los datos 'obligatorios' son suficiente para la creación, el show siempre se creará 'activo' por defecto. 
 *                 value:
 *                   movie_id: 1
 *                   room_id: 1
 *                   show_time: 2026-12-25 15:00:00
 *                   price: 7500.25
 *               enviar_con_datos_opcionales:
 *                 summary: ✔ Enviamos datos opcionales también.
 *                 description: Aunque opcional, uno puede enviar el estado de la sala en el body para que empiece como 'inactiva'.<br>is_active= 0 [La sala se creará como inactiva]
 *                 value:
 *                   movie_id: 1
 *                   room_id: 1
 *                   show_time: 2026-06-14 15:00:00
 *                   price: 3300.33
 *                   is_active: 0
 *               enviar_datos_extra:
 *                 summary: ⚠ Todo dato extra será ignorado.
 *                 description: En caso de recibir datos extra estos serán ignorados y se creará el registro con los datos mandatorios.
 *                 value:
 *                   movie_id: 1
 *                   room_id: 1
 *                   show_time: 2026-02-14 15:00:00
 *                   price: 6000.66
 *                   is_active: 1
 *                   vip: 0
 *                   reserved_seats: all
 *                   special_guests: 15
 *               falta_dato_obligatorio:
 *                 summary: ✖ No enviamos todos los datos necesarios.
 *                 description: En caso de no recibir datos clave, recibiremos un error detallando los campos faltantes.<br><br>`ERROR(400) "Faltan campos obligatorios= {datos faltantes}""`
 *                 value:
 *                   movie_id: 1
 *                   room_id: 1
 *               vincular_con_sala_inexistente:
 *                 summary: ✖ Queremos vincular con una sala inexistente.
 *                 description: En caso de enviar una ID que no pertenece a una sala existente, no se podrá crear el registro. Es vital contar con este dato para relacionar el show.<br><br>`ERROR(404) "No se encontró la sala a vincular"`
 *                 value:
 *                   movie_id: 1
 *                   room_id: 199919
 *                   show_time: 2026-08-08 15:00:00
 *                   price: 8000.00
 *               vincular_con_pelicula_inexistente:
 *                 summary: ✖ Queremos vincular con una pelicula inexistente.
 *                 description: En caso de enviar una ID que no pertenece a una película existente, no se podrá crear el registro. Es vital contar con este dato para relacionar el show.<br><br>`ERROR(404) "No se encontró la película a vincular"`
 *                 value:
 *                   movie_id: 909090
 *                   room_id: 1
 *                   show_time: 2026-08-24 15:00:00
 *                   price: 9000.66

 *     responses:
 *       201:
 *         description: Cinema creado exitosamente, devuelve el registro del nuevo show.
 *       400:
 *         description: Se envió un body vacío, faltan campos obligatorios o se enviaron valores inválidos.
 *       404:
 *         description: No se encontró una película o sala con los ID proporcionados. Ambos deben pertenecer a un registro válido para que la creación sea exitosa.
 *       500:
 *         description: Error interno del servidor.
 */

showsRouter.post('/', postShow);

/**
 * @swagger
 * /shows:
 *   get:
 *     summary: Busca y devuelve todos los shows.
 *     description: Busca todos los shows en la base de datos y los devuelve en un array.
 *     tags:
 *       - Shows
 *     responses:
 *       200:
 *         description: Devuelve un array con todos los shows en base de datos.
 *       500:
 *         description: Error interno del servidor
 */

showsRouter.get('/', getAllShows);

/**
 * @swagger
 * /shows/search:
 *   get:
 *     summary: Busca los shows que cumplan con los parametros de búsqueda enviados por query.
 *     description: Utiliza los parámetros que le mandamos por query, los filtra y devuelve un array con todas las coincidencias en DDBB.
 *     tags:
 *       - Shows
 *     parameters:
 *      - in: query
 *        name: movie_id
 *        schema:
 *         type: integer
 *         example: 1
 *        description: ID de la película a la que están relacionados los shows.
 *      - in: query
 *        name: room_id
 *        schema:
 *         type: integer
 *         example: 1
 *        description: ID de la sala a la que están relacionados los shows.
 *      - in: query
 *        name: show_time
 *        schema:
 *          type: string
 *          format: date-time
 *          example: 2026-06-14T15:00:00Z
 *          description: Filtra por fecha en que se lleva a cabo la función.
 *      - in: query
 *        name: price
 *        schema:
 *          type: number
 *          format: double
 *          example: 4500.00
 *        description: Filtra por precio del show.
 *     responses:
 *       200:
 *         description: Devuelve un array con todas las coincidencias en DDBB
 *       400:
 *         description: Se envió un body vacío ó ningún filtro válido para búsqueda.
 *       500:
 *         description: Error interno del servidor
 */

showsRouter.get('/search', getShowsByQuery);

/**
 * @swagger
 * /shows/{id}:
 *   get:
 *     summary: Busca un show por ID.
 *     description: Busca un show por ID y devuelve sus datos, pelicula y sala a la que está relacionada. 
 *     tags:
 *       - Shows
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *         type: integer
 *         example: 1
 *        description: ID del show a buscar.
 *     responses:
 *       200:
 *         description: Devuelve un objeto con los datos del show, la pelicula que se mostrará y la sala donde se proyectará.
 *       400:
 *         description: No se recibió ID por parametros o tiene un formato inválido.
 *       404:
 *         description: No se encontró un show con esa ID en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

showsRouter.get('/:id', getShowById);

/**
 * @swagger
 * /shows/{id}:
 *   patch:
 *     summary: Actualiza los datos no críticos de un show.
 *     description: Actualiza un show, recibe los datos a actualizar por body y el ID del show por params.
 *     tags:
 *       - Shows
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *         type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movie_id:
 *                 type: integer
 *                 description: ID de la película que se proyectará durante el show.
 *               room_id:
 *                 type: integer
 *                 description: ID de la sala donde se proyectará la película.
 *               show_time:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha cuando se llevará a cabo el show.
 *               price:
 *                 type: number
 *                 format: double
 *                 description: Precio de la entrada para ver el show.
 *               is_active:
 *                 type: boolean
 *                 description: Estado del espectáculo. (1) Activo (0) Inactivo
 *           examples:
 *               cambiar_una_propiedad:
 *                 summary: ✔ Cambiar una única propiedad.
 *                 description: Tenemos la opción de cambiar una sola propiedad del registro, siempre y cuando sea válida.
 *                 value:
 *                   price: 7500.50
 *               cambiar_varias_propiedades:
 *                 summary: ✔ Cambiar más de una propiedad.
 *                 description: Podemos cambiar tantas propiedades `[válidas]` como necesitemos en la misma petición.
 *                 value:
 *                   price: 6900.99
 *                   is_active: 0
 *                   show_time: 2026-06-15 15:45:00
 *               enviar_valores_validos_e_invalidos:
 *                 summary: ⚠ Ignora valores inválidos.
 *                 description: Los valores inválidos son ignorados, mientras enviemos algún valor válido por body- el servidor lo tomará y efectuará los cambios. <br>En el ejemplo enviamos un solo valor correcto (price) que será actualizado, mientras los demás serán ignorados.
 *                 value:
 *                   price: 10200.25
 *                   trending: 1
 *                   sold_out: 0
 *                   IMAX: 1
 *               enviar_valores_inválidos:
 *                 summary: ✖ Enviar solo valores inválidos.
 *                 description: Enviar solo valores que no son válidos para actualización devolverá un error como respuesta.<br><br>`ERROR(400) "Sin condiciones para actualizar"`
 *                 value:
 *                   trending: 1
 *                   sold_out: 0
 *                   IMAX: 1
 *               enviar_body_vacío:
 *                 summary: ✖ Enviar body vacío.
 *                 description: Al enviar un body vacío, el helper que construye la query de actualización lo detectará y recibiremos un error como respuesta.<br><br>`ERROR(400) "No se recibió nada por body"`
 *                 value: {}
 *     responses:
 *       200:
 *         description: Devuelve el registro completo actualizado del show.
 *       400:
 *         description: No encontramos datos válidos para cambiar.
 *       404:
 *         description: No se encontró un show con esa ID en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

showsRouter.patch('/:id', updateShow);

/**
 * @swagger
 * /shows/{id}:
 *   delete:
 *     summary: Borra el registro entero del show. [Hard delete]
 *     tags:
 *       - Shows
 *     description: Se envía el ID del show a borrar y se quita permanentemente de la base de datos .
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID del show a eliminar.
 *     responses:
 *       204:
 *         description: La convención REST dice que ante un DELETE exitoso se devuelve un 204 No Content.
 *       400:
 *         description: No se pudo actualizar correctamente. (ID inválido o no recibido por parametro)
 *       404:
 *         description: No se encontró un show con esa ID en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

showsRouter.delete('/:id', deleteShow);

module.exports = showsRouter;