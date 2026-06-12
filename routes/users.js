var express = require('express');
var router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require('../middleware/authenticate');
const isAdmin = require('../middleware/isAdmin');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Zarządzanie użytkownikami
 */

/**
 * @swagger
 * /users/login:
 *   get:
 *     summary: Formularz logowania
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Formularz logowania
 *   post:
 *     summary: Zaloguj użytkownika
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: Przekierowanie po zalogowaniu
 *       401:
 *         description: Nieprawidłowe dane logowania
 */
router.get('/login', userController.getUserLogin);
router.post('/login', userController.postUserLogin);

/**
 * @swagger
 * /users/logout:
 *   get:
 *     summary: Wyloguj użytkownika
 *     tags: [Users]
 *     responses:
 *       302:
 *         description: Przekierowanie po wylogowaniu
 */
router.get('/logout', userController.getUserLogout);

/**
 * @swagger
 * /users/add:
 *   get:
 *     summary: Formularz dodania użytkownika (tylko admin)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Formularz dodania użytkownika
 *       403:
 *         description: Brak uprawnień
 *   post:
 *     summary: Zapisz nowego użytkownika (tylko admin)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       302:
 *         description: Przekierowanie po zapisaniu
 *       400:
 *         description: Błąd walidacji
 *       403:
 *         description: Brak uprawnień
 */
router.get("/add", authenticate, isAdmin, userController.getUserAdd);
router.post("/add", authenticate, isAdmin, userController.postUserAdd);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista wszystkich użytkowników (tylko admin)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista użytkowników
 *       403:
 *         description: Brak uprawnień
 */
router.get("/", authenticate, isAdmin, userController.getUsers);

/**
 * @swagger
 * /users/{id}/delete:
 *   get:
 *     summary: Usuń użytkownika (tylko admin)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID użytkownika
 *     responses:
 *       302:
 *         description: Przekierowanie po usunięciu
 *       403:
 *         description: Brak uprawnień
 *       404:
 *         description: Nie znaleziono użytkownika
 */
router.get("/:id/delete", authenticate, isAdmin, userController.getUserDelete);

module.exports = router;