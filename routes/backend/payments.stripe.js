const express = require('express');
const stripe = require('../../models/clients/stripe/client.payment.stripe');
const jwt = require('../../middlewares/protection');
const cli = require('../../models/clients/user');
const app = express();

app.get('/', (request, response) => {
    let limit = Number(request.query.limit) || 5;
    let offset = Number(request.query.offset) || 0;
    try {
        stripe.find({}).skip(offset).limit(limit) // SIEMPRE EL POPULATE ES DE LA RESPUESTA JSON
            .populate('client').exec((err, invoices) => {
                if (err) {
                    return response.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                }
                cli.populate(invoices, {
                    path: 'client.client'
                }, (err, allOrder) => {
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
                        msg: 'Stripe Orders loaded successfully',
                        allOrder
                    });

                });
            });
    } catch (error) {
        throw error;
    }
});
app.get('/:invoice', (request, response) => {
    let id = request.params.invoice;
    try {
        stripe.findById(id).populate('client')
            .exec((err, invoices) => {
                if (err) {
                    return response.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Failure to connect with database server',
                        err
                    });
                }
                if (!invoices) {
                    return response.status(400).json({
                        status: false,
                        statusCode: 400,
                        msg: 'This order ID doesnt exists'
                    });
                }
                cli.populate(invoices, {
                    path: 'client.client'
                }, (err, allOrder) => {
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
                        msg: 'Stripe Orders loaded successfully',
                        allOrder
                    });

                });
            });
    } catch (error) {
        throw error;
    }
});

module.exports = app;