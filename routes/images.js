const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const authenticate = require('../middleware/authenticate');

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Zarządzanie obrazkami
 */

/**
 * @swagger
 * /images/add:
 *   get:
 *     summary: Formularz dodania obrazka
 *     tags: [Images]
 *     responses:
 *       200:
 *         description: Formularz dodania obrazka
 *       401:
 *         description: Brak autoryzacji
 *   post:
 *     summary: Dodaj obrazek (upload + zapis do bazy)
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               i_name:
 *                 type: string
 *               i_description:
 *                 type: string
 *               i_path:
 *                 type: string
 *                 format: binary
 *               i_gallery:
 *                 type: string
 *     responses:
 *       302:
 *         description: Przekierowanie po zapisaniu
 *       400:
 *         description: Błąd walidacji
 */
router.get("/add", authenticate, imageController.getImageUpload);
router.post("/add", authenticate, imageController.postImageUpload);

/**
 * @swagger
 * /images/{id}:
 *   get:
 *     summary: Widok pojedynczego obrazka
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID obrazka
 *     responses:
 *       200:
 *         description: Strona z obrazkiem
 *       404:
 *         description: Obrazek nie istnieje
 */
router.get("/:id", authenticate, imageController.getImageDetail);

/**
 * @swagger
 * /images/{id}/edit:
 *   get:
 *     summary: Formularz edycji obrazka
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Formularz edycji
 *       403:
 *         description: Brak uprawnień
 *   post:
 *     summary: Zapisz zmiany obrazka
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               i_name:
 *                 type: string
 *               i_description:
 *                 type: string
 *     responses:
 *       302:
 *         description: Przekierowanie po zapisaniu
 *       403:
 *         description: Brak uprawnień
 */
router.get("/:id/edit", authenticate, imageController.getImageEdit);
router.post("/:id/edit", authenticate, imageController.postImageEdit);

/**
 * @swagger
 * /images/{id}/delete:
 *   get:
 *     summary: Usuń obrazek
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Przekierowanie po usunięciu
 *       403:
 *         description: Brak uprawnień
 */
router.get("/:id/delete", authenticate, imageController.getImageDelete);

/**
 * @swagger
 * /images/{id}/comment:
 *   post:
 *     summary: Dodaj komentarz do obrazka
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       302:
 *         description: Przekierowanie po dodaniu komentarza
 *       401:
 *         description: Brak uprawnień
 */
router.post("/:id/comment", authenticate, imageController.postAddComment);
module.exports = router;