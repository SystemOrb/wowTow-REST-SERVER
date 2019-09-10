const express = require('express');
const app = express();
const CarsPrices = require('../../models/clients/tax/client.car.type');

app.get('/', (req, res) => {
    try {
        CarsPrices.find({}).exec((err, Cars) => {
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
    let newCartType = new CarsPrices({
        car_type: body.car_type,
        car_truck: body.car_truck,
        truck_price: body.truck_price
    });
    try {
        newCartType.save((err, carType) => {
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
    let CarType = new CarsPrices({
        car_type: body.car_type,
        car_truck: body.car_truck,
        truck_proce: body.truck_price,
        _id: id
    });
    try {
        CarsPrices.findByIdAndUpdate(id, CarType, { new: true })
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
        CarsPrices.findOneAndRemove(id).exec((err, deleted) => {
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