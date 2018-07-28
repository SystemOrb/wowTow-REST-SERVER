const express = require('express');
const RiskControl = require('../../models/clients/client.risk');
const _ = require('underscore');
const app = express();

app.get('/', (request, response) => {
    let offset = Number(request.query.offset) || 0;
    let limit = Number(request.query.limit) || 10;
    try {
        RiskControl.find({}).limit(limit).skip(offset)
            .populate('car_model')
            .exec((err, control) => {
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
                    msg: 'Control Risk for all clients loaded',
                    control
                });
            });
    } catch (error) {
        throw error;
    }
});
app.get('/:id', (request, response) => {
    let id = request.params.id;
    try {
        RiskControl.find({ _id: id }).populate('car_model')
            .exec((err, control) => {
                if (err) {
                    return response.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                }
                if (!control) {
                    return response.status(400).json({
                        status: false,
                        statusCode: 400,
                        msg: 'This Risk doesnt exists'
                    });
                }
                response.status(200).json({
                    status: true,
                    statusCode: 200,
                    msg: 'Control Risk for this client loaded',
                    control
                });
            });
    } catch (error) {
        throw error;
    }
});
// Colocar un riesgo como atendido y compltado
app.put('/:riskControl', (request, response) => {
    let id = request.params.riskControl;
    let object = _.pick(request.body, ['risk_status']);
    try {
        RiskControl.findByIdAndUpdate(id, object, { new: true }, (err, Risk) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            if (!Risk) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    msg: 'This Risk doesnt exists'
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Control Risk for this client has been completed',
                Risk
            });
        });
    } catch (error) {
        throw error;
    }
});
// Eliminar un riesgo
app.delete('/:risk', (request, response) => {
    let id = request.params.risk;
    try {
        RiskControl.findByIdAndRemove(id, (err, Risk) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            if (!Risk) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    msg: 'This Risk doesnt exists'
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Control Risk for this client has been deleted',
                Risk
            });
        });
    } catch (error) {
        throw error;
    }
});
module.exports = app;