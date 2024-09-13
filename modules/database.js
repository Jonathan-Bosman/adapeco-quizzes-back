const mysql = require('mysql2');
const database = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE
});

module.exports = database;