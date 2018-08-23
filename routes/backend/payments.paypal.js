const express = require('express');
const paypal = require('../../models/clients/paypal/client.address-payment.model');
const jwt = require('../../middlewares/protection');
const app = express();

app.get('/', (request, response) => {
    let offset = Number(request.query.offset) || 0;
    let limit = Number(request.query.limit) || 10;
    try {
        paypal.find({}).skip(offset).limit(limit).populate('service')
            .exec((err, invoice) => {
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
                    msg: 'Paypal invoices has been loaded',
                    invoice
                });
            });
    } catch (error) {
        throw error;
    }
    paypal.find({});
});
app.get('/:invoice', (request, response) => {
    let _key = request.params.invoice;
    try {
        paypal.findById(_key).populate('service').exec((err, invoice) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to connect with database server',
                    err
                });
            }
            if (!invoice) {
                return response.status(400).json({
                    status: false,
                    statusCode: 400,
                    msg: 'This Order ID doesnt exists'
                });
            }
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Paypal invoices has been loaded',
                invoice
            });
        });
    } catch (error) {
        throw error;
    }
});

module.exports = app;