const express = require('express');
const carModel = require('../../models/clients/client.car.model');
const CarImg = require('../../models/clients/client.car.image');
const client = require('../../models/clients/user');
const CarClientImages = require('../../models/clients/client.car.image');
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
// Crear un carro con imagen incluida sin pasar por el upload
app.post('/image/', (req, res) => {
    let body = req.body;
    console.log(body);
    try {
        let ClientData = new CarClientImages({
            car_model: body.car_model_id,
            car_image: body.car_images
        });
        ClientData.save((err, model) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            res.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Model car loaded successfully',
                model
            });
        });
    } catch (error) {
        throw error;
    }
});
// Actualizar un carro que tiene la URL de firebase
app.put('/image/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;
    console.log(body);
    try {
        CarClientImages.findByIdAndUpdate(id, { car_image: body.car_images })
            .exec((err, data) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                }
                if (!data) {
                    return res.status(400).json({
                        status: false,
                        statusCode: 400,
                        msg: 'Models with this id doesnt exists'
                    });
                }
                res.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: 'Model car has been updated successfully',
                    model: data
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
// Devolver todos los datos del carro, de un mismo cliente
app.get('/image/cars/:id', (req, res) => {
    let id = req.params.id;
    try {
        carModel.find({ client: id }).exec((err, customerCars) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            // Verificamos si encontro Carros registrados para poder hacer el match
            if (!customerCars) {
                return res.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: 'Not Cars found but is not error',
                });
            }
            const ArrayVehiclesWithImage = new Array(); // Si va encontrando carros con imagen lo guarda en la pila del arreglo
            for (const vehicle of customerCars) {
                // Encontro carros, verificamos si tiene imagen!
                CarImg.find({ car_model: vehicle._id }).populate('car_model')
                    .exec((err, carWithImage) => {
                        if (err) {
                            return res.status(500).json({
                                status: false,
                                statusCode: 500,
                                msg: 'Failure to connect with database server',
                                err
                            });
                        }
                        ArrayVehiclesWithImage.push(carWithImage[0]);
                    });
            }
            setTimeout(() => {
                res.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: 'Client profile loaded',
                    data: ArrayVehiclesWithImage
                });
            }, 2000);
        });
    } catch (error) {
        throw error
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
// Borramos un vehiculo con imagen incluido
app.delete('/:idCarImage/:idModelCar', (req, res) => {
    const idDbImage = req.params.idCarImage;
    const IdDBModel = req.params.idModelCar;
    try {
        CarImg.findByIdAndRemove(idDbImage)
            .exec((err, data) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                }
                if (!data) {
                    return res.status(400).json({
                        status: false,
                        statusCode: 400,
                        msg: 'This Car Doesn´t exists',
                        err
                    });
                }
                carModel.findByIdAndRemove(IdDBModel).exec((err, res2) => {
                    if (err) {
                        return res.status(500).json({
                            status: false,
                            statusCode: 500,
                            msg: 'Failure to connect with database server',
                            err
                        });
                    }
                    if (!res2) {
                        return res.status(400).json({
                            status: false,
                            statusCode: 400,
                            msg: 'This Car Doesn´t exists',
                            err
                        });
                    }
                    res.status(200).json({
                        status: true,
                        statusCode: 200,
                        msg: 'Car removed',
                        res2
                    });
                });
            });
    } catch (error) {
        throw error;
    }
});
module.exports = app;