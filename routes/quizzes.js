const express = require('express');
const router = express.Router();
const db = require('../modules/database.js');
const jwt = require('jsonwebtoken');
const authorizationJWT = require('../modules/auth.js');

/**
 * @swagger
 * /quizzes:
 *   get:
 *     summary: Récupérer tous les quizzes
 *     description: Récupère tous les quizzes si l'utilisateur est un administrateur, ou uniquement les quizzes visibles pour les autres utilisateurs.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des quizzes
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
 *                   title:
 *                     type: string
 *                     example: 'Titre du quiz'
 *                   text:
 *                     type: string
 *                     example: 'Description du quiz'
 *                   is_visible:
 *                     type: boolean
 *                     example: true
 *                   id_user:
 *                     type: integer
 *                     example: 25
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authorizationJWT, (req, res) => {
    let sql = '';
    if(req.user.role==='admin'){
        sql = 'SELECT * FROM quizzes';
    } else {
        sql = 'SELECT * FROM quizzes WHERE is_visible = 1';
    }
    db.query(sql, (err, results) => {
        if(err){
            return res.status(500).json({ error: 'Erreur serveur', details: err });
        }
        return res.status(200).json(results);
    });
});

router.get('/visible', (req, res) => {
    const sql = 'SELECT * FROM quizzes WHERE is_visible = 1';
    db.query(sql, (err, results) => {
        if(err){
            return res.status(500).json({ error: 'Erreur serveur', details: err });
        }
        return res.status(200).json(results);
    });
});

router.post('/create', authorizationJWT, async (req, res) => {
    const {title, text, is_visible } = req.body;
    id_user = req.user.id;
    const sql = 'INSERT INTO quizzes (title, text, is_visible, id_user) VALUES (?,?,?,?)';
    db.query(sql, [title, text, is_visible, id_user], (err, results) => {
        if (err) {
            console.error('Erreur SQL :', err);
            return res.status(500).json({ error: 'Erreur serveur', details: err });
        }
        return res.status(200).send({ message: 'Quiz créé avec succès', id: res.id });
    });
});

router.get('/:id', authorizationJWT, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM quizzes WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if(err){
            return res.status(500).json({ error: 'Erreur serveur', details: err });
        }
        if(results[0].is_visible!==1 && req.user.role!=='admin'){
            return res.status(500).send('Forbidden');
        }
        return res.status(200).json(results);
    });
});

module.exports = router;