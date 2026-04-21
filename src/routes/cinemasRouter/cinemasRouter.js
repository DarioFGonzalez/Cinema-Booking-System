const {Router} = require('express');
const { getCinemaById, getAllCinemas, getCinemasByQuery } = require('../../handlers/cinemasHandlers/getCinemas');
const postCinema = require('../../handlers/cinemasHandlers/postCinema');
const { updateCinema, toggleActiveCinema } = require('../../handlers/cinemasHandlers/updateCinema');
const deleteCinema = require('../../handlers/cinemasHandlers/deleteCinema');
const cinemasRouter = Router();

/**
 * @swagger
 * /cinemas:
 *   post:
 *     summary: Crea un nuevo cinema.
 *     description: Enviamos datos básicos para crear un nuevo Cinema en la base de datos..
 *     tags:
 *       - Cinemas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - city
 *             properties:
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *           examples:
 *               cine_en_caballito:
 *                 summary: ✔ Cine en Caballito.
 *                 value:
 *                   name: Cinemark Caballito
 *                   city: Caballito
 *               cine_en_almagro:
 *                 summary: ✔ Cine hoyts en almagro.
 *                 value:
 *                   name: Hoyts Almagro
 *                   city: Almagro
 *               solo_datos_necesarios:
 *                 summary: ✔ Enviamos solo datos necesarios.
 *                 value:
 *                   name: Cine ejemplo
 *                   city: Ciudad ejemplo
 *               enviar_con_datos_opcionales:
 *                 summary: ✔ Enviamos datos opcionales también.
 *                 description: Si no enviamos los datos opcionales, en este caso is_active, este quedaría en 1 (activo) por defecto.
 *                 value:
 *                   name: Cine independiente microcentro
 *                   city: Microcentro
 *                   is_active: 0
 *               enviar_datos_extra:
 *                 summary: ⚠ Todo dato extra será ignorado.
 *                 description: En caso de recibir datos extra estos serán ignorados y se creará el registro con los datos obligatorios.
 *                 value:
 *                   name: Cineapolis NORTE
 *                   city: Nordelta
 *                   is_active: 0
 *                   province: Buenos Aires
 *                   country: Argentina
 *                   zipcode: b1616
 *               no_enviar_dato_obligatorio:
 *                 summary: ✖ No enviar todos los datos necesarios.
 *                 description: En caso de no recibir datos clave, recibiremos un error detallando los campos faltantes.<br>(400) `Faltan campos obligatorios> {datos faltantes}`
 *                 value:
 *                   name: Solo el nombre
 *     responses:
 *       201:
 *         description: Cinema creado exitosamente
 *       400:
 *         description: Datos inválidos o faltantes
 *       500:
 *         description: Error interno del servidor
 */

cinemasRouter.post('/', postCinema);

/**
 * @swagger
 * /cinemas:
 *   get:
 *     summary: Busca y devuelve todos los cinemas.
 *     description: Busca todos los cinemas en la base de datos y los devuelve en un array.
 *     tags:
 *       - Cinemas
 *     responses:
 *       200:
 *         description: Devuelve un array con todos los cinemas en base de datos.
 *       500:
 *         description: Error interno del servidor
 */

cinemasRouter.get('/', getAllCinemas);

/**
 * @swagger
 * /cinemas/search:
 *   get:
 *     summary: Busca los cinemas que cumplan con los parametros de búsqueda enviados por query.
 *     description: Utiliza los parámetros que le mandamos por query, los filtra y devuelve un array con todas las coincidencias en DDBB.
 *     tags:
 *       - Cinemas
 *     parameters:
 *      - in: query
 *        name: name
 *        schema:
 *         type: string
 *         example: Cinema de Prueba
 *        description: Filtramos cinemas por nombre.
 *      - in: query
 *        name: city
 *        schema:
 *          type: string
 *          example: CABA
 *          description: Filtra por ciudad donde está el cinema.
 *      - in: query
 *        name: is_active
 *        schema:
 *          type: boolean
 *          enum: [0, 1]
 *          example: 1
 *        description: Filtra por el estado del cinema.<br><br>`(1) Activo (0) Inactivo`
 *     responses:
 *       200:
 *         description: Devuelve un array con todas las coincidencias en DDBB.
 *       400:
 *         description: Se envió un body vacío ó ningún filtro válido para búsqueda.
 *       500:
 *         description: Error interno del servidor.
 */

cinemasRouter.get('/search', getCinemasByQuery);

/**
 * @swagger
 * /cinemas/{id}:
 *   get:
 *     summary: Busca un cinema por ID
 *     description: Busca específicamente por ID y devuelve todos sus datos junto a las salas que tenga relacionadas.
 *     tags:
 *       - Cinemas
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *         type: string
 *         example: 11111111-1111-1111-1111-111111111111
 *        description: UUID del cinema.
 *     responses:
 *       200:
 *         description: Devuelve un objeto con los datos y relacionales del Cinema buscado.
 *       400:
 *         description: Datos inválidos o faltantes.
 *       404:
 *         description: No se encontró un cinema con esa ID en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

cinemasRouter.get('/:id', getCinemaById)

/**
 * @swagger
 * /cinemas/{id}:
 *   patch:
 *     summary: Actualiza los datos no críticos de un cinema.
 *     description: Recibe datos a cambiar por body y actualiza un cinema por ID.
 *     tags:
 *       - Cinemas
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *         type: string
 *         example: 11111111-1111-1111-1111-111111111111
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *           examples:
 *               # ========== EJEMPLOS EXITOSOS ==========
 *               cambiar_solo_nombre:
 *                 summary: ✔ Cambiamos solo el nombre de un cinema.
 *                 value:
 *                   name: Cinema con un nombre nuevo
 *               cambiar_solo_la_ciudad:
 *                 summary: ✔ Cambiamos solo la ciudad de un cinema.
 *                 value:
 *                   city: Tigre
 *               cambiar_ambos_valores:
 *                 summary: ✔ Podemos cambiar ambos valores del cinema.
 *                 value:
 *                   name: Cine independiente Floresta
 *                   city: Floresta
 *               enviar_valores_validos_e_invalidos:
 *                 summary: ⚠ Ignora valores inválidos mientras tenga por lo menos uno válido.
 *                 description: Los valores inválidos son ignorados, mientras enviemos UN valor válido por body- el servidor lo tomará y efectuará los cambios.
 *                 value:
 *                   name: Cine Nueva Philadelphia
 *                   telephone: 4746-4826
 *                   owner: Dario Gonzalez
 *                   country: Argentina
 *               # ========== EJEMPLOS DE ERROR ==========
 *               enviar_valores_inválidos:
 *                 summary: ✖ Enviar valores inválidos.
 *                 description: Enviar solo valores que no son válidos para actualización devolverá un error 400 ("Sin condiciones para actualizar") como respuesta
 *                 value:
 *                   address: Varela 1955
 *                   zipcode: f1417
 *               enviar_body_vacío:
 *                 summary: ✖ Enviar body vacío.
 *                 description: Al enviar un body vacío, el helper que construye la query de actualización lo detecta y responde con un error 400 ("No se recibió nada por body").
 *                 value: {}
 *     responses:
 *       200:
 *         description: Devuelve el registro completo del cinema actualizado.
 *       400:
 *         description: No encontramos datos válidos para cambiar.
 *       404:
 *         description: No se encontró un cinema con esa ID en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

cinemasRouter.patch('/:id', updateCinema);

/**
 * @swagger
 * /cinemas/{id}/toggle:
 *   patch:
 *     summary: Cambia el estado (activo/inactivo) de un cinema.
 *     tags:
 *       - Cinemas
 *     description: Se fija el estado actual del cinema y lo settea en su opuesto (toggle).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 11111111-1111-1111-1111-111111111111
 *         description: UUID del cinema.
 *     responses:
 *       200:
 *         description: Cambia el estado del cinema, devuelve un mensaje de éxito.
 *       400:
 *         description: No se pudo actualizar correctamente. (ID inválido o no recibido por parametro)
 *       404:
 *         description: No se encontró un cinema con esa ID en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

cinemasRouter.patch('/:id/toggle', toggleActiveCinema);

/**
 * @swagger
 * /cinemas/{id}:
 *   delete:
 *     summary: Borra el registro entero del Cinema. [Hard delete]
 *     tags:
 *       - Cinemas
 *     description: Se envía el ID del cinema a borrar y se quita permanentemente de la base de datos .
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 11111111-1111-1111-1111-111111111111
 *         description: UUID del cinema a eliminar.
 *     responses:
 *       204:
 *         description: La convención REST dice que ante un DELETE exitoso se devuelve un 204 No Content.
 *       400:
 *         description: No se pudo actualizar correctamente. (ID inválido o no recibido por parametro)
 *       404:
 *         description: No se encontró un cinema con esa ID en la base de datos.
 *       500:
 *         description: Error interno del servidor.
 */

cinemasRouter.delete('/:id', deleteCinema);

module.exports = cinemasRouter;