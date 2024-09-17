const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.PRIVATE_KEY

const authorizationJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.sendStatus(403);
    }
    jwt.verify(token, secretKey, (err, user) => {
        if(err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    })
}

module.exports = authorizationJWT;