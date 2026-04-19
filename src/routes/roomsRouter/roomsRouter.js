const {Router} = require('express');
const postRoom = require('../../handlers/roomsHandlers/postRoom');
const { getAllRooms, getRoomById, getRoomShowsByStatus } = require('../../handlers/roomsHandlers/getRooms');
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
 * /rooms/{id}:
 *   get:
 *     summary: Busca una sala por ID.
 *     description: Busca una sala por ID y devuelve todos sus datos junto al número de shows activos, inactivos y en total que tenga relacionadas.
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
 *         description: Devuelve un objeto con los datos y estadísticas de shows de la sala buscada.
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
 * /rooms/{id}/status:
 *   get:
 *     summary: Busca shows de una sala por estado
 *     description: etorna todos los shows de una sala específica, filtrados por estado (activo o inactivo)
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
 *      - in: query
 *        name: status
 *        required: true
 *        schema:
 *          type: string
 *          enum: [active, inactive]
 *        description: Estado de los shows a filtrar
 *     responses:
 *       200:
 *         description: Lista de shows relacionados a la sala que cumplen el criterio buscado.
 *       400:
 *         description: El parámetro de búsqueda por query es inválido, no se recibió ninguno o no se recibió ID por parametros.
 *       404:
 *         description: No se encontró una sala con esa ID en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

roomsRouter.get('/:id/status', getRoomShowsByStatus);

module.exports = roomsRouter;