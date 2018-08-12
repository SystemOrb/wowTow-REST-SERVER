const express = require('express');
const carModel = require('../../models/clients/client.car.model');
const CarImg = require('../../models/clients/client.car.image');
const client = require('../../models/clients/user');
const app = express();
// Todos los carros registrados por el cliente en caso de que use
// Mas de un vehiculo
app.get('/all/:client', (request, response) => {
    let id = request.params.client;
    try {
        carModel.find({ client: id }).populate('client')
            .exec((err, Models) => {
                if (err) {
                    return response.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                }
                if (!Models) {
                    return response.status(400).json({
                        status: false,
                        statusCode: 400,
                        msg: 'Models with this id doesnt exists'
                    });
                }
                response.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: 'Model car loaded successfully',
                    Models
                });
            });
    } catch (error) {
        throw error;
    }
});
// Para obtener los detalles de un carro especifico
app.get('/:car', (request, response) => {
    try {
        let car_id = request.params.car;
        carModel.find({ _id: car_id }).populate('client')
            .exec((err, Models) => {
                if (err) {
                    return response.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                }
                if (!Models) {
                    return response.status(400).json({
                        status: false,
                        statusCode: 400,
                        msg: 'Models with this id doesnt exists'
                    });
                }
                response.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: 'Model car loaded successfully',
                    Models
                });
            })
    } catch (error) {
        throw error;
    }
});
app.post('/', (request, response) => {
    let body = request.body;
    try {
        let ClientCar = new carModel({
            client: body.client,
            car_name: body.car_name,
            car_colour: body.car_colour,
            car_plate: body.car_plate,
            car_model: body.car_model
        });
        ClientCar.save((err, Models) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Model car loaded successfully',
                Models
            });
        });
    } catch (error) {
        throw error;
    }
});
// Actualizar un carro
app.put('/:car_id', (request, response) => {
    let _id = request.params.car_id;
    let body = request.body;
    try {
        carModel.findByIdAndUpdate(_id, body, (err, Models) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            if (!Models) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    msg: 'Models with this id doesnt exists'
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Model car has been updated successfully',
                Models
            });
        });
    } catch (error) {
        throw error;
    }
});
app.delete('/:car_id', (request, response) => {
    let _id = request.params.car_id;
    try {
        carModel.findByIdAndRemove(_id, (err, Models) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            if (!Models) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    msg: 'Models with this id doesnt exists'
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Model car has been removed successfully',
                Models
            });
        });
    } catch (error) {
        throw error;
    }
});
// Para el picture del carro
app.get('/image/:id', (request, response) => {
    let id_ = request.params.id;
    try {
        CarImg.find({ car_model: id_ }).populate('car_model')
            .exec((err, car) => {
                if (err) {
                    return response.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                }
                if (!car) {
                    return response.status(400).json({
                        status: false,
                        statusCode: 400,
                        msg: 'Models with this id doesnt exists'
                    });
                }
                client.populate(car, {
                    path: 'car_model.client'
                }, (err, resp) => {
                    if (err) throw err;
                    response.status(200).json({
                        status: true,
                        statusCode: 200,
                        msg: 'Client profile loaded',
                        resp
                    });
                });
            });
    } catch (error) {
        throw error;
    }
});
app.get('/', (request, response) => {
    let offset = Number(request.query.offset) || 0;
    let limit = Number(request.query.limit) || 15;
    try {
        CarImg.find({}).skip(offset).limit(limit).populate('car_model')
            .exec((err, car) => {
                if (err) {
                    return response.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                }
                client.populate(car, {
                    path: 'car_model.client'
                }, (err, customer) => {
                    if (err) {
                        return response.status(500).json({
                            status: false,
                            statusCode: 500,
                            msg: 'Failure to connect with database server',
                            err
                        });
                    }
                    response.status(200).json({
                        status: true,
                        statusCode: 200,
                        msg: 'Customers loaded',
                        customer
                    });
                });
            });
    } catch (error) {
        throw error;
    }
});
module.exports = app;