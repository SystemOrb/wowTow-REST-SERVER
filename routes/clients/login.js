// Para iniciar sesión en el wowtow como cliente
const express = require('express');
const app = express();
const userSchema = require('../../models/clients/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const expires = require('../../config/settings').expires;
const apikey = require('../../config/settings').secretKey;
// Create new user
app.post('/', (request, response) => {
    let body = request.body;
    let new_client = new userSchema({
        email: body.email,
        name: body.name,
        phone: body.phone,
        password: bcrypt.hashSync(body.password, 10)
    });
    try {
        new_client.save((err, client) => {
            if (err) {
                return response.status(400).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database',
                    err
                });
            }
            // generate token for this new client
            let token = jwt.sign({
                data: client
            }, apikey, { expiresIn: expires });
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'client registered successfully',
                client,
                token
            });
        });
    } catch (error) {
        throw error
    }
});
app.put('/:id', (req, res) => {
    let body = req.body;
    let id = req.params.id;
    let client = new userSchema({
        name: body.name,
        password: bcrypt.hashSync(body.password, 10),
        _id: id
    });
    try {
        userSchema.findByIdAndUpdate(id, client, { new: true })
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database',
                        err
                    });
                }
                if (!data) {
                    return res.status(400).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Not user found',
                    });
                }
                res.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: 'client updated successfully',
                    data,
                });
            });
    } catch (error) {
        throw error;
    }
});
// Imagen
app.put('/image/:id', (req, res) => {
    let body = req.body;
    let id = req.params.id;
    let client = new userSchema({
        picture: body.picture,
        _id: id
    });
    try {
        userSchema.findByIdAndUpdate(id, client, { new: true })
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database',
                        err
                    });
                }
                if (!data) {
                    return res.status(400).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Not user found',
                    });
                }
                res.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: 'client updated successfully',
                    data,
                });
            });
    } catch (error) {
        throw error;
    }
});
// Login
app.post('/auth', (request, response) => {
    let body = request.body;
    // step 1: We Verify if the email exists
    userSchema.findOne({ email: body.email }, (err, client) => {
        if (err) {
            return response.status(500).json({
                status: false,
                statusCode: 500,
                msg: 'Failure to connect with database',
                err
            });
        }
        if (!client) { // not results for this email           
            return response.status(400).json({
                status: false,
                statusCode: 400,
                msg: 'Invalid username/password pair'
            });
        }
        // step 2 verify password
        if (bcrypt.compareSync(body.password, client.password)) {
            // Credentials correctly
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Logged successfully',
                token: jwt.sign({
                    data: client
                }, apikey, { expiresIn: expires }),
                data: client
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
// Actualizar parametros
app.put('/customer/:_id', (req, res) => {
    const customerId = req.params._id;
    const body = req.body;
    let bodySchema = new userSchema({
        AppPlayerId: body.AppPlayerId,
        _id: customerId
    });
    try {
        userSchema.findByIdAndUpdate(customerId, bodySchema, { new: true })
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