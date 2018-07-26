const express = require('express');
const towCar = require('../../models/grueros/tows_cars');
const app = express();

app.post('/:employer_id', (request, response) => {
    let body = request.body;
    let driver = request.params.employer_id;
    try {
        let tow = new towCar({
            tow_name: body.tow_name,
            driver,
            tow_plate: body.tow_plate,
            tow_model: body.tow_model,
        });
        tow.save((err, newTowCar) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to register your new tow car',
                    err
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Your car has been afiliated successfully',
                newTowCar
            });
        });
    } catch (error) {
        throw error;
    }
});

module.exports = app;