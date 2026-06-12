var express = require('express');
var router = express.Router();
const galleryController = require("../controllers/galleryController");
const authenticate = require('../middleware/authenticate');

/**
 * @swagger
 * tags:
 *   name: Galleries
 *   description: Zarządzanie galeriami użytkowników
 */

/**
 * @swagger
 * /galleries:
 *   get:
 *     summary: Lista wszystkich galerii
 *     tags: [Galleries]
 *     responses:
 *       200:
 *         description: Strona z listą galerii
 *       401:
 *         description: Brak autoryzacji
 */
router.get("/", authenticate, galleryController.getGalleries);

/**
 * @swagger
 * /galleries/add:
 *   get:
 *     summary: Formularz dodania galerii
 *     tags: [Galleries]
 *     responses:
 *       200:
 *         description: Formularz dodania galerii
 *       401:
 *         description: Brak autoryzacji
 *   post:
 *     summary: Zapisz nową galerię
 *     tags: [Galleries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       302:
 *         description: Przekierowanie po zapisaniu
 *       400:
 *         description: Błąd walidacji
 */
router.get("/add", authenticate, galleryController.getGalleryAdd);
router.post("/add", authenticate, galleryController.postGalleryAdd);

/**
 * @swagger
 * /galleries/{id}:
 *   get:
 *     summary: Widok pojedynczej galerii z obrazkami
 *     tags: [Galleries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID galerii
 *     responses:
 *       200:
 *         description: Strona galerii z miniaturkami
 *       404:
 *         description: Galeria nie istnieje
 */
router.get("/:id", authenticate, galleryController.getGalleryDetail);

/**
 * @swagger
 * /galleries/{id}/edit:
 *   get:
 *     summary: Formularz edycji galerii
 *     tags: [Galleries]
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
 *     summary: Zapisz zmiany w galerii
 *     tags: [Galleries]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       302:
 *         description: Przekierowanie po zapisaniu
 *       403:
 *         description: Brak uprawnień
 */
router.get("/:id/edit", authenticate, galleryController.getGalleryEdit);
router.post("/:id/edit", authenticate, galleryController.postGalleryEdit);

/**
 * @swagger
 * /galleries/{id}/delete:
 *   get:
 *     summary: Usuń galerię
 *     tags: [Galleries]
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
router.get("/:id/delete", authenticate, galleryController.getGalleryDelete);

module.exports = router;