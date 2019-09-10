const express = require('express');
const app = express();
const CarModel = require('../../models/clients/tax/client.fee');

app.get('/', (req, res) => {
    try {
        CarModel.find({}).exec((err, Cars) => {
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
                msg: 'Model vehicles loaded',
                Cars
            });
        });
    } catch (error) {
        throw error;
    }
});
// Para crear nueva tarifa en base al tipo de vehiculo
app.post('/', (req, res) => {
    let body = req.body;
    let newSystemFee = new CarModel({
        extra_miles: body.extra_miles,
        // car_truck: body.car_truck,
        dispatch_service: body.dispatch_service,
        max_miles: body.max_miles,
        wootow_fee: body.wootow_fee,
        charge_nigth: body.charge_nigth,
        city: body.city
    });
    try {
        newSystemFee.save((err, carType) => {
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
                msg: 'Model vehicles loaded',
                carType
            });
        });
    } catch (error) {
        throw error;
    }
});
// Para actualizar el modelo
app.put('/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let SystemFee = new CarModel({
        extra_miles: body.extra_miles,
        // car_truck: body.car_truck,
        dispatch_service: body.dispatch_service,
        max_miles: body.max_miles,
        wootow_fee: body.wootow_fee,
        charge_nigth: body.charge_nigth,
        city: body.city,
        _id: id
    });
    try {
        CarModel.findByIdAndUpdate(id, SystemFee, { new: true })
            .exec((err, Update) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                }
                if (!Update) {
                    return res.status(400).json({
                        status: false,
                        statusCode: 500,
                        msg: 'This model doesn´t exists',
                        Update
                    });
                }
                res.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: 'Items updated',
                    Update
                });
            });
    } catch (error) {
        throw error;
    }
});
app.delete('/:id', (req, res) => {
    let id = req.params.id;
    try {
        CarModel.findOneAndRemove(id).exec((err, deleted) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            if (!deleted) {
                return res.status(400).json({
                    status: false,
                    statusCode: 500,
                    msg: 'This model doesn´t exists',
                    deleted
                });
            }
            res.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Item removed',
                deleted
            });
        });
    } catch (error) {
        throw error;
    }
});

module.exports = app;