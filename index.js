const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const { dbConfig, port } = require('./config');
const auth = require('./src/routes/v1/auth');
const mokiniai = require('./src/routes/v1/mokiniai');

const main = async () => {
    const app = express();
    try {
        const connection = await mysql.createConnection(dbConfig)

        app.use(express.json());
        app.use(cors());
        app.mysql = connection;

        app.use('/v1/auth', auth);
        app.use('/v1/mokiniai', mokiniai);
       
        app.get('*', (req, res) => {
            res.status(404).send({ error: 'Page not found' })
        });

        app.listen(port, () => {
            console.log(`Server running on port: ${port}`);
        });
    } catch (error) {
        console.error(error, 'Something wrong with database');
    }

};

main();