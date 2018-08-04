const express = require('express');
const app = express();
const paypal = require('../../config/paypal');
const jwt = require('../../middlewares/protection');
const paypalSchema = require('../../models/clients/paypal/client.paypal.payment.model');
const paypalAddress = require('../../models/clients/paypal/client.address-payment.model');
app.post('/', [jwt.TokenSecurity], (request, response) => {
    let body = request.body;
    let fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    try {
        paypal.payment.create({
            "intent": "authorize",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": fullUrl,
                "cancel_url": "https://www.google.com/"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": body.name,
                        "sku": body.id,
                        "price": body.price,
                        "currency": body.currency,
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": body.currency,
                    "total": body.total
                },
                "description": body.description
            }]
        }, async(err, payment) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to process your payment please try later',
                    err
                });
            }
            let href = await HrefPayment(payment);
            // let executePaid = await executePayment(payment, response, href);
            response.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Your payment has been approved',
                payment,
                href
            });
        });
    } catch (error) {
        throw error;
    }
});
let HrefPayment = (payment) => {
    return new Promise((resolve, reject) => {
        for (let linkExecution of payment.links) {
            if (linkExecution.rel === 'approval_url') {
                let tokenUrl = linkExecution.href.split('&');
                let payer_id = tokenUrl[1].replace('token=', '');
                resolve({
                    href: linkExecution.href,
                    code: payer_id
                });
            }
        }
    });
}
let executePayment = (payment, callback, payer_id) => {
        return new Promise((resolve, reject) => {
            paypal.payment.execute(payment.id, {
                "payer_id": payer_id,
                "transactions": payment.transactions
            }, (err, PaypalApprobation) => {
                if (err) {
                    return callback.status(500).json({
                        status: false,
                        statusCode: 500,
                        msg: 'Paypal cannot process your payment',
                        err
                    });
                }
                resolve({
                    'status': true,
                    'data': PaypalApprobation
                });
            });
        });
    }
    //Confirm payment
app.get('/', (request, response) => {
    let payer_id = request.query.PayerID;
    let payment_id = request.query.paymentId;
    try {
        paypal.payment.get(payment_id, async(err, capture) => {
            if (err) {
                return response.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Paypal cannot process your payment',
                    err
                });
            }
            let executionPayment = await executePayment(capture, response, payer_id);
            // Save in database
            if (executionPayment.status) {
                RegisterOrder(executionPayment.data, response);
            }
        });
    } catch (error) {
        throw error;
    }
});
let RegisterOrder = (payment, callback) => {
    try {
        let PAYMENT = new paypalSchema({
            item_name: payment.transactions[0].item_list.items[0].name,
            item_price: payment.transactions[0].item_list.items[0].price,
            item_currency: payment.transactions[0].item_list.items[0].currency,
            item_description: payment.transactions[0].description,
            payment_ref: payment.cart,
            payment_date: payment.create_time,
            payment_merchant: payment.transactions[0].payee.email,
            payer_name: payment.payer.payer_info.first_name,
            payer_lastname: payment.payer.payer_info.last_name,
            payer_email: payment.payer.payer_info.email,
            payment_method: payment.payer.payment_method
        });
        PAYMENT.save((err, invoice) => {
            if (err) {
                return callback.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to register this order in our system',
                    err
                });
            }
            addAddress(payment, callback, invoice);
        });
    } catch (error) {
        throw error;
    }
}
let addAddress = (invoice, callback, DB) => {
    try {
        let Address = new paypalAddress({
            payer_name: invoice.payer.payer_info.shipping_address.recipient_name,
            payer_address: invoice.payer.payer_info.shipping_address.line1,
            payer_city: invoice.payer.payer_info.shipping_address.city,
            payer_postcode: invoice.payer.payer_info.shipping_address.postal_code,
            payer_country: invoice.payer.payer_info.shipping_address.country_code,
            service: DB._id
        });
        Address.save((err, complete) => {
            if (err) {
                return callback.status(500).json({
                    status: false,
                    statusCode: 500,
                    msg: 'Failure to register this order in our system',
                    err
                });
            }
            callback.status(200).json({
                status: true,
                statusCode: 200,
                msg: 'Your invoice has been completed',
                invoice,
                complete
            });
        });
    } catch (error) {
        throw error;
    }
}
module.exports = app;