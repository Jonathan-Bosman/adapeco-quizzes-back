require('dotenv').config();
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const db = require('../modules/database.js');
const usersRoutes = require('../routes/users.js');
const app = express();

app.use('/', usersRoutes);
app.use(bodyParser.json());
app.use('/api/users', usersRoutes);

db.connect((err) => {
    if (err) console.log(err);
});

describe('GET /', () => {
    it('Should get all the users', async () => {
        const response = await request(app).get('/api/users/');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });
});

describe('POST /create', () => {
    it('Should insert a new user in the users table', async () => {
        const payload = {
            firstname: 'aaa',
            lastname: 'aaa',
            email: 'aaaaaaa@aaa.com', // change the e-mail adress to a unique one
            pass: '12345!',
            role: 'user'
        };
        const response = await request(app)
            .post('/api/users/create')
            .send(payload)
            .set('Content-Type', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Utilisateur/trice créé/e avec succès');
    });
});

describe('POST /login', () => {
    it('Should send an id, a role and a jwt if the email and pass match', async () => {
        const payload = {
            email: 'aaa@aaa.com', // an existing e-mail 
            pass: '12345!'
        };
        const response = await request(app)
            .post('/api/users/login')
            .send(payload)
            .set('Content-Type', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(typeof response.body.token).toBe('string');
    });
});

describe('PUT /update/:id', () => {
    it('Should change the user corresponding to the id', async () => {
        const id = 13;
        const payload = {
            firstname: 'bbb',
            lastname: 'bbb',
            email: 'bbb@aaa.com', // change the e-mail adress to a unique one
            pass: '12345!',
            role: 'user'
        };
        const response = await request(app)
            .put(`/api/users/update/${id}`)
            .send(payload)
            .set('Content-Type', 'application/json');
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Utilisateur/trice modifié/e');
    });
});

describe('DELETE /update/:id', () => {
    it('Should change the user corresponding to the id', async () => {
        const id = 13;
        const response = await request(app)
            .delete(`/api/users/delete/${id}`)
        console.log(response.body);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Utilisateur/trice éffacé/e');
    });
});

describe('GET /:id', () => {
    it('Should get the user corresponding to the id in the url', async () => {
        const id = 1;
        const response = await request(app).get(`/api/users/${id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });
});