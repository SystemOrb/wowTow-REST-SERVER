const express = require('express');
const app = express();
const ObjectCar = require('../../models/clients/client.car.model');
const carPicture = require('../../models/clients/client.car.image')
const bank = require('../../models/clients/stripe/client.payment.stripe');
const geolocation = require('../../models/backend/google/geolocation');
app.get('/profile/:key', (req, res) => {
    // ID principal del cliente que dio el sistema cuando se registro, no el modelo ni la imagen
    const key = req.params.key;
    try {
        ObjectCar.find({ _id: key }).populate('client')
            .exec(async(err, CarModel) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Error on this operation',
                        err
                    });
                }
                if (!CarModel) {
                    return res.status(400).json({
                        status: false,
                        statusCode: 400,
                        msg: 'Models with this id doesnt exists'
                    });
                }
                // Image Profile
                const picture = await PictureCar(CarModel[0]._id, res);
                if (picture.length >= 1) {
                    res.status(200).json({
                        status: true,
                        statusCode: 200,
                        msg: 'Customer Service All data loaded',
                        car: CarModel[0],
                        picture: picture[0].car_image
                    });
                } else {
                    res.status(200).json({
                        status: true,
                        statusCode: 200,
                        msg: 'Customer Service All data loaded',
                        car: CarModel[0],
                        picture: null
                    });
                }
            });
    } catch (error) {
        throw error;
    }
});
let PictureCar = (model_id, callback) => {
        return new Promise((resolve, reject) => {
            carPicture.find({ car_model: model_id }).exec((err, thumbnail) => {
                if (err) {
                    callback.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to resolve this operation',
                        err
                    });
                }
                if (!thumbnail) {
                    resolve(false);
                    return;
                }
                resolve(thumbnail);
            });
        });
    }
    /*
    Función par obtener los datos economicos de un servicio que fue solicitado por el cliente
    para que lo pueda visualizar el conductor
    */
app.get('/economic/service/:PaymentKey', (req, res) => {
    let paymentTransactionId = req.params.PaymentKey;
    try {
        bank.findById(paymentTransactionId).exec((err, transaction) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to process your operation',
                    err
                });
            }
            res.status(200).json({
                status: true,
                statusCode: 200,
                transaction
            });
        });
    } catch (error) {
        throw error;
    }
});
/*
Función que sirve para actualizar el estatus del servicio y colocar 
quien fue el conductor que tomo el servicio para finalmente mostrarselo
al cliente en su dashboard
*/
app.put('/track/:serviceKey', (req, res) => {
    let ServiceRef = req.params.serviceKey;
    let body = req.body;
    try {
        geolocation.findByIdAndUpdate(ServiceRef, body)
            .exec((err, updateTracking) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to process your operation',
                        err
                    });
                }
                res.status(200).json({
                    status: true,
                    statusCode: 200,
                    updateTracking
                });
            });
    } catch (error) {
        throw error;
    }
});
/*
Función que retorna los servicios ya tomados por el conductor
y aun no ha sido terminado para pintarlos en el mapa
Debemos pasar el ID del conductor de la grua
*/
app.get('/track/routing/:employer', (req, res) => {
    const employer = req.params.employer;
    try {
        geolocation.find({
            provider: employer,
            completed: false,
            taken: true
        }).exec((err, routing) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to process your operation',
                    err
                });
            }
            res.status(200).json({
                status: true,
                statusCode: 200,
                routing
            });
        });
    } catch (error) {
        throw error;
    }
});
module.exports = app;