const express = require('express');
const router = express.Router();
const db = require('../modules/database.js');
const jwt = require('jsonwebtoken');
const authorizationJWT = require('../modules/auth.js');

router.get('/', (req, res) => {
    const sql = 'SELECT * FROM questions';
    db.query(sql, (err, results) => {
        if(err){
            return res.status(500).json({ error: 'Erreur serveur', details: err });
        }
        return res.status(200).json(results);
    });
});

router.post('/create', authorizationJWT, async (req, res) => {
    const {text, answers, correct_answer, id_quiz} = req.body;
    const sql = 'INSERT INTO questions (text, answers, correct_answer, id_quiz) VALUES (?, ?, ?, ?)';
    db.query(sql, [text, JSON.stringify(answers), correct_answer, id_quiz], (err, results) => {
        if (err) {
            console.error('Erreur SQL :', err);
            return res.status(500).json({ error: 'Erreur serveur', details: err });
        }
        return res.status(200).send({ message: 'Question créé avec succès', name: text });
    });
});

module.exports = router;