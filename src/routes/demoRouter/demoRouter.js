const {Router} = require('express');
const resetDatabase = require('../../handlers/demoHandlers/reset');
const demoRouter = Router();

/**
 * @swagger
 * /demo/reset:
 *   patch:
 *     summary: 🔁 Resetea toda la base de datos.
 *     description: Elimina `todos` los datos existentes y recrea las tablas con los datos semilla.<br><br>Útil para limpiar el entorno de pruebas después de hacer experimentos.
 *     tags:
 *       - 🔁 Reset
 *     responses:
 *       200:
 *         description: Base de datos reseteada exitosamente.
 *       500:
 *         description: Error interno del servidor
 */

demoRouter.patch('/reset', resetDatabase);

module.exports = demoRouter;