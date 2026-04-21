const {Router} = require('express');
const postRoom = require('../../handlers/roomsHandlers/postRoom');
const { getAllRooms, getRoomById, getRoomsByQuery } = require('../../handlers/roomsHandlers/getRooms');
const updateRoom = require('../../handlers/roomsHandlers/updateRoom');
const deleteRoom = require('../../handlers/roomsHandlers/deleteRoom');
const roomsRouter = Router();

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Crea un nuevo registro de sala.
 *     description: Crea una nueva sala con los datos enviados y la relaciona con el cine en el que se encuentra.
 *     tags:
 *       - Salas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cinema_id
 *               - capacity
 *             properties:
 *               cinema_id:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *           examples:
 *               solo_datos_necesarios:
 *                 summary: ✔ Enviamos solo datos necesarios.
 *                 description: Los datos 'obligatorios' son suficiente para la creación, la sala siempre se creará 'activa' por defecto. 
 *                 value:
 *                   cinema_id: 11111111-1111-1111-1111-111111111111
 *                   capacity: 75
 *               enviar_con_datos_opcionales:
 *                 summary: ✔ Enviamos datos opcionales también.
 *                 description: Aunque opcional, uno puede enviar el estado de la sala en el body para que empiece como 'inactiva'.<br>is_active= 0 [La sala se creará como inactiva]
 *                 value:
 *                   cinema_id: 11111111-1111-1111-1111-111111111111
 *                   capacity: 75
 *                   is_active: 0
 *               enviar_datos_extra:
 *                 summary: ⚠ Todo dato extra será ignorado.
 *                 description: En caso de recibir datos extra estos serán ignorados y se creará el registro con los datos mandatorios.
 *                 value:
 *                   cinema_id: 11111111-1111-1111-1111-111111111111
 *                   capacity: 70
 *                   style: retro
 *                   category: 3D
 *                   inauguration_date: 2026-04-04
 *               falta_dato_obligatorio:
 *                 summary: ✖ No enviar todos los datos necesarios.
 *                 description: En caso de no recibir datos clave, recibiremos un error detallando los campos faltantes.<br>(400) `Faltan campos obligatorios> {datos faltantes}`
 *                 value:
 *                   capacity: 150
 *                   is_active: 1
 *               enviar_cinema_id_inválido:
 *                 summary: ✖ Queremos vincular la sala a un Cine inexistente.
 *                 description: En caso de enviar un ID que no corresponda a ningún Cinema en base de datos, recibiremos un mensaje de error.<br>(404) `Cinema no encontrado.`
 *                 value:
 *                   cinema_id: 21111112-2112-2112-2112-211111111112
 *                   capacity: 100
 *                   is_active: 1
 *     responses:
 *       201:
 *         description: Cinema creado exitosamente
 *       400:
 *         description: Datos inválidos o faltantes
 *       404:
 *         description: No se encontró un cine con el ID proporcionado. Verificar que el cinema_id exista antes de crear una sala asociada.
 *       500:
 *         description: Error interno del servidor
 */

roomsRouter.post('/', postRoom);

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Busca y devuelve todas las salas.
 *     description: Busca todas las salas en la base de datos y las devuelve en un array.
 *     tags:
 *       - Salas
 *     responses:
 *       200:
 *         description: Devuelve un array con todas las salas en base de datos.
 *       500:
 *         description: Error interno del servidor
 */

roomsRouter.get('/', getAllRooms);

/**
 * @swagger
 * /rooms/search:
 *   get:
 *     summary: Busca las salas que cumplan con los parametros de búsqueda enviados por query.
 *     description: Utiliza los parámetros que le mandamos por query, los filtra y devuelve un array con todas las coincidencias en DDBB.
 *     tags:
 *       - Salas
 *     parameters:
 *      - in: query
 *        name: cinema_id
 *        schema:
 *         type: string
 *         example: 11111111-1111-1111-1111-111111111111
 *        description: ID del cinema al que están relacionadas las salas.
 *      - in: query
 *        name: capacity
 *        schema:
 *          type: integer
 *          example: 80
 *          description: Filtra por capacidad de sala.
 *      - in: query
 *        name: is_active
 *        schema:
 *          type: integer
 *          enum: [0, 1]
 *          example: 1
 *        description: Filtra por estado activo (1) o inactivo (0)
 *     responses:
 *       200:
 *         description: Devuelve un array con todas las coincidencias en DDBB.
 *       400:
 *         description: Se envió un body vacío ó ningún filtro válido para búsqueda.
 *       500:
 *         description: Error interno del servidor
 */

roomsRouter.get('/search', getRoomsByQuery);

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     summary: Busca una sala por ID.
 *     description: Busca una sala por ID y devuelve sus datos, estadísticas de shows y la lista de shows activos. 
 *     tags:
 *       - Salas
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *         type: string
 *         example: 1
 *        description: ID de la sala a buscar.
 *     responses:
 *       200:
 *         description: Devuelve un objeto con los datos, estadísticas de los shows de la sala buscada y sus shows activos.
 *       400:
 *         description: No se recibió ID por parametros o tiene un formato inválido.
 *       404:
 *         description: No se encontró una sala con esa ID en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

roomsRouter.get('/:id', getRoomById);

/**
 * @swagger
 * /rooms/{id}:
 *   patch:
 *     summary: Actualiza los datos no críticos de una sala.
 *     description: Actualiza una sala, recibe los datos a actualizar por body y el ID de sala por params.
 *     tags:
 *       - Salas
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
 *               is_active:
 *                 type: boolean
 *               capacity:
 *                 type: integer
 *           examples:
 *               cambiar_una_propiedad:
 *                 summary: ✔ Cambiar una única propiedad.
 *                 description: Tenemos la opción de cambiar una sola propiedad del registro, siempre y cuando sea válida.
 *                 value:
 *                   capacity: 33
 *               cambiar_varias_propiedades:
 *                 summary: ✔ Cambiar mas de una propiedad.
 *                 value:
 *                   capacity: 66
 *                   is_active: 0
 *               enviar_valores_validos_e_invalidos:
 *                 summary: ⚠ Ignora valores inválidos.
 *                 description: Los valores inválidos son ignorados, mientras enviemos algún valor válido por body- el servidor lo tomará y efectuará los cambios. <br>En el ejemplo enviamos un solo valor correcto (capacity) que será actualizado, mientras los demás serán ignorados.
 *                 value:
 *                   capacity: 66
 *                   is_beautifull: 1
 *                   deluxe: TRUE
 *                   zipcode: B1415
 *               enviar_valores_inválidos:
 *                 summary: ✖ Enviar solo valores inválidos.
 *                 description: Enviar solo valores que no son válidos para actualización devolverá un error 400 ("Sin condiciones para actualizar") como respuesta
 *                 value:
 *                   type: 3D
 *                   catering: false
 *               enviar_body_vacío:
 *                 summary: ✖ Enviar body vacío.
 *                 description: Al enviar un body vacío, el helper que construye la query de actualización lo detecta y responde con un error 400 ("No se recibió nada por body").
 *                 value: {}
 *     responses:
 *       200:
 *         description: Devuelve el registro completo de la sala actualizada.
 *       400:
 *         description: No encontramos datos válidos para cambiar.
 *       404:
 *         description: No se encontró una sala con esa ID en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

roomsRouter.patch('/:id', updateRoom);

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Borra el registro entero de la sala. [Hard delete]
 *     tags:
 *       - Salas
 *     description: Se envía el ID de la sala a borrar y se quita permanentemente de la base de datos .
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 2
 *         description: ID de la sala a eliminar.
 *     responses:
 *       204:
 *         description: La convención REST dice que ante un DELETE exitoso se devuelve un 204 No Content.
 *       400:
 *         description: No se pudo actualizar correctamente. (ID inválido o no recibido por parametro)
 *       404:
 *         description: No se encontró una sala con esa ID en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

roomsRouter.delete('/:id', deleteRoom);

module.exports = roomsRouter;