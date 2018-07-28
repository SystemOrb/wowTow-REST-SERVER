const express = require('express');
const RiskControl = require('../../models/clients/client.risk');
const app = express();

app.post('/:client_car', (request, response) => {
    let _id = request.params.client_car;
    let body = request.body;
    try {
        let risk = new RiskControl({
            car_model: _id,
            risk_average: body.risk_average,
            risk_comment: body.risk_comment
        });
        risk.save((err, Risk) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server, please verify your connection or try later',
                    Risk
                });
            }
            response.status(200).json({
                status: false,
                statusCode: 500,
                msg: 'Risk Control Created please wait for our support team',
                Risk
            });
        });
    } catch (error) {
        throw error;
    }
});

module.exports = app;