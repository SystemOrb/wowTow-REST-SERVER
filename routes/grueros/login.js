// Para iniciar sesión en el wowtow como grueroe
const express = require('express');
const app = express();
const userSchema = require('../../models/grueros/employer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const expires = require('../../config/settings').expires;
const apikey = require('../../config/settings').secretKey;
// Create new user
app.post('/', (request, response) => {
    let body = request.body;
    let new_gruero = new userSchema({
        email: body.email,
        name: body.name,
        password: bcrypt.hashSync(body.password, 10)
    });
    try {
        new_gruero.save((err, gruero) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database',
                    err
                });
            }
            // generate token for this new gruero
            let token = jwt.sign({
                data: gruero
            }, apikey, { expiresIn: expires });
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'gruero registered successfully',
                gruero,
                token
            });
        });
    } catch (error) {
        throw error
    }
});
// Login
app.post('/auth', (request, response) => {
    let body = request.body;
    // step 1: We Verify if the email exists
    userSchema.findOne({ email: body.email }, (err, gruero) => {
        if (err) {
            return response.status(500).json({
                status: false,
                statusCode: 500,
                msg: 'Failure to connect with database',
                err
            });
        }
        if (!gruero) { // not results for this email           
            return response.status(400).json({
                status: false,
                statusCode: 400,
                msg: 'Invalid username/password pair'
            });
        }
        // step 2 verify password
        if (bcrypt.compareSync(body.password, gruero.password)) {
            // Credentials correctly
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Logged successfully',
                token: jwt.sign({
                    data: gruero
                }, apikey, { expiresIn: expires }),
                data: gruero
            });
        } else {
            // Password not match
            return response.status(400).json({
                status: false,
                statusCode: 400,
                msg: 'Invalid username/password pair'
            });
        }
    });
});


module.exports = app;