require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./modules/database.js');
const usersRoutes = require('./routes/users.js');
const quizzesRoutes = require('./routes/quizzes.js');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(cors({
    origin: 'http://localhost:8080'
}))
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API quiz',
            version: '0.0.1',
            description: '',
            contact: {
                name: 'Jonathan'
            },
        },
        servers: [{url: 'http://localhost:3000/api'}]
    },
    apis: ['./routes/*js']
}
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(bodyParser.json());
app.use('/api/users', usersRoutes);
app.use('/api/quizzes', quizzesRoutes);

db.connect((err) => {
    if (err) {console.log(err);}
    else {console.log('bravo');}
});

const port = process.env.PORT || 3333;
app.listen(port, () => {console.log('SERVEUR DEMMARÉ');});