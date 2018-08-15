const express = require('express');
const RiskControl = require('../../models/clients/client.risk');
const Client = require('../../models/clients/user');
const app = express();

app.post('/:client_car', (request, response) => {
    let _id = request.params.client_car;
    let body = request.body;
    try {
        let risk = new RiskControl({
            car_model: _id,
            risk_average: body.risk_average,
            risk_comment: body.risk_comment,
            risk_date: body.risk_date
        });
        risk.save((err, Risk) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server, please verify your connection or try later',
                    err
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
app.get('/', (request, response) => {
    let offset = Number(request.query.offset) || 0;
    let pagination = Number(request.query.limit) || 15;
    try {
        RiskControl.find({ risk_status: false }).skip(offset).limit(pagination).populate('car_model')
            .exec((err, Risk) => {
                if (err) {
                    return response.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server, please verify your connection or try later',
                    });
                }
                Client.populate(Risk, {
                    path: 'car_model.client'
                }, (err, dataTransfer) => {
                    if (err) {
                        return response.status(500).json({
                            status: false,
                            statusCode: 500,
                            msg: 'Failure to connect with database server, please verify your connection or try later',
                            err
                        });
                    }
                    response.status(200).json({
                        status: true,
                        statusCode: 200,
                        msg: 'Risk Controls loaded',
                        dataTransfer
                    });
                });
            });
    } catch (error) {
        throw error;
    }
});
app.get('/:risk', (request, response) => {
    let _id = request.params.risk;
    try {
        RiskControl.findById(_id).populate('car_model')
            .exec((err, Risk) => {
                if (err) {
                    return response.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server, please verify your connection or try later',
                        err
                    });
                }
                if (!Risk) {
                    return response.status(400).json({
                        status: false,
                        statusCode: 400,
                        msg: 'This Ticket with this ID doesnt exists',
                    });
                }
                Client.populate(Risk, {
                    path: 'car_model.client'
                }, (err, dataTransfer) => {
                    if (err) {
                        return response.status(500).json({
                            status: false,
                            statusCode: 500,
                            msg: 'Failure to connect with database server, please verify your connection or try later',
                            err
                        });
                    }
                    response.status(200).json({
                        status: true,
                        statusCode: 200,
                        msg: 'Risk Controls loaded',
                        dataTransfer
                    });
                });
            });
    } catch (error) {
        throw error;
    }
});
app.delete('/:risk', (request, response) => {
    let _id = request.params.risk;
    try {
        RiskControl.findByIdAndRemove(_id).populate('car_model')
            .exec((err, Risk) => {
                if (err) {
                    return response.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server, please verify your connection or try later',
                        err
                    });
                }
                if (!Risk) {
                    return response.status(400).json({
                        status: false,
                        statusCode: 400,
                        msg: 'This Ticket with this ID doesnt exists',
                    });
                }
                response.status(200).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Risk Controls Removed',
                    Risk
                });
            });
    } catch (error) {
        throw error;
    }
});
module.exports = app;