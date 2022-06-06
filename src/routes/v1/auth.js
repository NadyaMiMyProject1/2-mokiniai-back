const { Router } = require('express');
const joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../../../config');

const router = Router();

const userSchema = joi.object({
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(8).required(),
})

router.post('/register', async (req, res) => {
    let userData = req.body;
    const { mysql } = req.app;
    try {
        userData = await userSchema.validateAsync(userData);
    } catch (error) {
        return res.status(412).send(
            {
                error: 'Neteisingi duomenys.',
                data: userData
            }
        );
    }

    try {
        const hashPw = bcrypt.hashSync(userData.password, 10);

        const query = `INSERT INTO users (email, password)
        VALUES (${mysql.escape(userData.email)}, '${hashPw}')`;

        const [data] = await mysql.query(query);
        return res.status(201).send(data)
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Bandykite dar kartą!' })
    }
});

router.post('/login', async (req, res) => {
    let userData = req.body;
    const { mysql } = req.app;

    try {
        userData = await userSchema.validateAsync(userData);
    } catch (error) {
        return res.status(404).send({ error: 'Neteisingas el. paštas arba slaptažodis.' })
    }

    try {
        const query = `SELECT * FROM users
        WHERE email = ${mysql.escape(userData.email)}`;

        const [data] = await mysql.query(query);
        if (data.length === 0) {
            return res.status(404).send({ error: 'Neteisingas el. paštas arba slaptažodis.s' })
        }

        const isAuthed = bcrypt.compareSync(userData.password, data[0].password);

        if (!isAuthed) {
            return res.status(400).send({ error: 'Neteisingas el. paštas arba slaptažodis.' })
        }

        const token = jwt.sign({ id: data[0].id, email: data[0].email }, jwtSecret);
        return res.status(200).send({ msg: 'Sėkmingai prisijungėte', token });
    } catch (error) {
        return res.status(500).send({ error: 'Bandykite dar kartą!' })
    }
})

module.exports = router;