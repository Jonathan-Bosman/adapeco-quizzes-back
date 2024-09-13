const express = require('express');
const router = express.Router();
const db = require('../modules/database.js');
const jwt = require('jsonwebtoken');
const authorizationJWT = require('../modules/auth.js');

router.get('/', (req, res) => {
    const sql = "SELECT * FROM quizzes";
    db.query(sql, (err, results) => {
        if(err){
            return res.status(500).send(err);
        }
        return res.status(200).json(results);
    });
});