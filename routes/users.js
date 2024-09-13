const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../modules/database.js');
const jwt = require('jsonwebtoken');
const authorizationJWT = require('../modules/auth.js');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 25
 *                   firstname:
 *                     type: string
 *                     example: 'aaa'
 *                   lastname:
 *                     type: string
 *                     example: 'aaa'
 *                   email:
 *                     type: string
 *                     example: 'aaa'
 *                   pass:
 *                     type: string
 *                     example: 'aaa'
 *                   role:
 *                     type: string
 *                     example: 'user'
 */
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, results) => {
        if(err){
            return res.status(500).send(err);
        }
        return res.status(200).json(results);
    });
});

/**
 * @swagger
 * /users/create:
 *   post:
 *     summary: Créer un/e nouvel/le utilisateur/trice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: 'aaa'
 *               lastname:
 *                 type: string
 *                 example: 'aaa'
 *               email:
 *                 type: string
 *                 example: 'aaa@example.com'
 *               pass:
 *                 type: string
 *                 example: 'password123'
 *               role:
 *                 type: string
 *                 example: 'user'
 *     responses:
 *       200:
 *         description: Utilisateur/trice créé/e avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Utilisateur/trice créé/e'
 */
router.post('/create', async (req, res) => {
    const {firstname, lastname, email, pass, role} = req.body;
    bcrypt.hash(pass, 10).then((hashedPass) => {
        const sql = 'INSERT INTO users (firstname, lastname, email, pass, role) VALUES (?,?,?,?,?)';
        db.query(sql, [firstname, lastname, email, hashedPass, role], (err, results) => {
            if (err) {
                console.error('Erreur SQL :', err);
                return res.status(500).send(err);
            }
            return res.status(200).send({ message: 'Utilisateur/trice créé/e avec succès', name: firstname });
        });
    }).catch(err => {
        console.error('Erreur bcrypt :', err);
        return res.status(500).send({ error: 'Erreur de hachage' });
    });
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Se connecter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: 'aaa@example.com'
 *               pass:
 *                 type: string
 *                 example: 'password123'
 *     responses:
 *       200:
 *         description: Utilisateur/trice connecté/e avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: 'very.long.gibberish'
 */
router.post('/login', async (req, res) => {
    const {email, pass} = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if(err){
            console.error('Erreur de requête à la base de donnée.');
            return res.status(500).send(err);
        }
        if(results.length<1){
            console.log('Aucun utilisateur avec l\'e-mail ', email, '.');
            return res.status(401).json({message: 'E-mail ou mot de passe incorrect.'});
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(pass, user.pass);

        if(!isMatch){
            console.log('Le mot de passe ne correspond pas pour l\'utilisateur');
            return res.status(401).json({message: 'E-mail ou mot de passe incorrect.'});
        }

        const token = jwt.sign({id : user.id, role : user.role}, process.env.PRIVATE_KEY, {expiresIn: '1h'});
        return res.status(200).json({token: token});
    });
});

/**
 * @swagger
 * /users/update/{id}:
 *   put:
 *     summary: Modifier un utilisateur/trice
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur/trice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: 'aaa'
 *               lastname:
 *                 type: string
 *                 example: 'aaa'
 *               email:
 *                 type: string
 *                 example: 'aaa@example.com'
 *               pass:
 *                 type: string
 *                 example: 'hashed-word-salad'
 *               role:
 *                 type: string
 *                 example: 'user'
 *     responses:
 *       200:
 *         description: Utilisateur/trice modifié/e avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Utilisateur/trice modifié/e'
 */
router.put('/update/:id', async (req, res) => {
    const {firstname, lastname, email, pass, role} = req.body;
    const id = req.params.id;
    const hashedPass = await bcrypt.hash(pass, 10);
    console.log([firstname, lastname, email, hashedPass, role, id]);

    const sql = 'UPDATE users SET firstname = ?, lastname = ?, email = ?, pass = ?, role = ? WHERE id = ?'
    db.query(sql, [firstname, lastname, email, hashedPass, role, id], (err, results) => {
        if(err){
            console.error('Erreur de requête à la base de donnée.');
            return res.status(500).send(err);
        }
        return res.status(200).json({message: 'Utilisateur/trice modifié/e'});
    });
});

/**
 * @swagger
 * /users/delete/{id}:
 *   delete:
 *     summary: Éffacer l'utilisateur/trice correspondant à l'url
 *     parameters:
 *       - in: path               # L'élément "in" doit être à l'intérieur d'une liste
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur/trice
 *     responses:
 *       200:
 *         description: Éffacement d'un/e utilisateur/trice
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: 'Utilisateur/trice éffacé/e'
 */
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params.id;
    const sql = 'DELETE FROM users WHERE id = ?'
    db.query(sql, [id], (err, results) => {
        if(err){
            console.error('Erreur de requête à la base de donnée.');
            return res.status(500).send(err);
        }
        return res.status(200).json({message: 'Utilisateur/trice éffacé/e'});
    });
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Récupérer l'utilisateur/trice correspondant à l'url
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur/trice
 *     responses:
 *       200:
 *         description: Détails d'un/e utilisateur/trice
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 25
 *                   firstname:
 *                     type: string
 *                     example: 'aaa'
 *                   lastname:
 *                     type: string
 *                     example: 'aaa'
 *                   email:
 *                     type: string
 *                     example: 'aaa'
 *                   pass:
 *                     type: string
 *                     example: 'aaa'
 *                   role:
 *                     type: string
 *                     example: 'user'
 */
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if(err){
            return res.status(500).send(err);
        }
        return res.status(200).json(results);
    });
});

module.exports = router;