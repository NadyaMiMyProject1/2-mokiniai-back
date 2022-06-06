const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { loggedInMiddleware } = require('../../middleware/loggedIn');

const { jwtSecret } = require('../../../config');
const loggedIn = require('../../middleware/loggedIn');

const router = Router();

async function getMokiniai(mysql, user_id) {
    const query = `
            SELECT 
                d.id,
                d.firstname,
                d.lastname,
                d.email,
                d.birth_date,
                d.user_id
            FROM 
                mokiniai d
                WHERE user_id = ?               
            ;
            `;

    const [mokiniai] = await mysql.query(query, [user_id]);

    return mokiniai;
}

router.post('/', loggedInMiddleware, async (req, res) => {
    const { mysql } = req.app;
    const user_id = req.token.id;
    const { firstname, lastname, email, birth_date } = req.body

    try {
        const query = `
        INSERT INTO mokiniai 
            (firstname, lastname, email, birth_date, user_id)
        VAlUES 
            (?, ?, ?, ?, ?)
        `;

        await mysql.query(
            query,
            [firstname, lastname, email, birth_date, user_id]
        );

        return res.status(201).send({
            firstname,
            lastname,
            email,
            birth_date,
            user_id
        })
    } catch (error) {
        res.status(500).send({
            error: error.message,
        });
    }
})

router.get("/", loggedInMiddleware, async (req, res) => {
    try {
        const { mysql } = req.app;

        console.log(req.token);

        const user_id = req.token.id;

        const mokiniai = await getMokiniai(mysql, user_id);

        res.send({
            mokiniai,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.message,
        });
    }
});


router.patch('/', loggedInMiddleware, async (req, res) => {
    const { mysql } = req.app;
    const user_id = req.token.id;

    const { id, firstname, lastname, email, birth_date } = req.body

    try {
        const query = `
            UPDATE mokiniai 
                SET
                    firstname = ?,
                    lastname = ?,
                    email = ?, 
                    birth_date = ?
                WHERE
                    user_id = ?
                    AND
                    id = ?
        `;

        await mysql.query(
            query,
            [firstname, lastname, email, birth_date, user_id, id]
        );

        return res.status(201).send({
            firstname,
            lastname,
            email,
            birth_date,
            user_id
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.message,
        });
    }
})

router.delete('/:mokinio_id', loggedInMiddleware, async (req, res) => {
    const { mysql } = req.app;
    const user_id = req.token.id;
    const mokinio_id = req.params.mokinio_id;

    try {
        const query = `
            DELETE FROM mokiniai
                WHERE
                    user_id = ?
                    AND
                    id = ?
        `;

        await mysql.query(
            query,
            [user_id, mokinio_id]
        );

        return res.status(201).send({
            mokinio_id
        });
    } catch (error) {
        res.status(500).send({
            error: error.message,
        });
    }
})



module.exports = router;