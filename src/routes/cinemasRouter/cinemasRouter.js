const {Router} = require('express');
const { getCinemaById, getAllCinemas } = require('../../handlers/cinemasHandlers/getCinemas');
const postCinema = require('../../handlers/cinemasHandlers/postCinema');
const { updateCinema, toggleActiveCinema } = require('../../handlers/cinemasHandlers/updateCinema');
const deleteCinema = require('../../handlers/cinemasHandlers/deleteCinema');
const cinemasRouter = Router();

/**
 * @swagger
 * /cinemas:
 *   post:
 *     summary: Crea un nuevo cinema
 *     description: Enviamos datos básicos para crear un nuevo Cinema en la base de datos..
 *     tags:
 *       - Cinemas
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
 *               cine_en_varela:
 *                 summary: ✔ Sala de cine experimental en la calle varela.
 *                 value:
 *                   name: Cine experimental Varela
 *                   city: Flores
 *               cine_en_microcentro:
 *                 summary: ✔ Sala de cine independiente en microcentro.
 *                 value:
 *                   name: Cine independiente microcentro
 *                   city: Microcentro
 *               datos_insuficientes:
 *                 summary: ✖ Enviar datos insuficientes para la creación.
 *                 description: Si no enviamos todos los datos críticos para la creación del cinema, recibiremos como respuesta un error 400 "Faltan valores necesarios para crear el cinema".
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