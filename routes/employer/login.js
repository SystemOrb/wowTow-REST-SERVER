// Para iniciar sesión en el wowtow como conductor
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
        password: bcrypt.hashSync(body.password, 10),
        city: body.city,
        phone: body.phone
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
// Actualizar parametros del conductor como AppId, Coordenadas
app.put('/provider/:_id', (req, res) => {
    const providerId = req.params._id;
    const body = req.body;
    let bodySchema = new userSchema({
        currentLat: body.currentLat,
        currentLng: body.currentLng,
        AppPlayerId: body.AppPlayerId,
        _id: providerId
    });
    try {
        userSchema.findByIdAndUpdate(providerId, bodySchema, { new: true })
            .exec((err, updated) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                }
                // if not find any result with this id
                if (!updated) {
                    return res.status(200).json({
                        status: false,
                        statusCode: 400,
                        msg: 'The document with this ID doesnt exist',
                        err
                    });
                }
                // Mostramos los datos actualizados
                res.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: 'Items updated',
                    updated
                });
            });
    } catch (error) {
        throw error;
    }
});
// Actualizar parametros del conductor como AppId, Coordenadas
app.put('/provider/picture/:_id', (req, res) => {
    const providerId = req.params._id;
    const body = req.body;
    let bodySchema = new userSchema({
        profile: body.profile,
        _id: providerId
    });
    try {
        userSchema.findByIdAndUpdate(providerId, bodySchema, { new: true })
            .exec((err, updated) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                }
                // if not find any result with this id
                if (!updated) {
                    return res.status(200).json({
                        status: false,
                        statusCode: 400,
                        msg: 'The document with this ID doesnt exist',
                        err
                    });
                }
                // Mostramos los datos actualizados
                res.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: 'Items updated',
                    updated
                });
            });
    } catch (error) {
        throw error;
    }
});
module.exports = app;