const express = require('express');
const app = express();
const secretKey = require('../../config/settings').StripeSecretKey;
const stripe = require('stripe')(secretKey);
const jwt = require('../../middlewares/protection');
const car = require('../../models/clients/client.car.model');
const stripeDB = require('../../models/clients/stripe/client.payment.stripe');
app.post("/charge", [jwt.TokenSecurity], async(req, res) => {
    let client_car = req.query.car_id;
    let amount = 500;
    let clientPaymentFromService = await objectClient(client_car);
    if (clientPaymentFromService.status) {
        try {
            stripe.customers.create({
                    email: req.body.email,
                    card: req.body.id
                })
                .then(customer =>
                    stripe.charges.create({
                        amount,
                        description: "Sample Charge",
                        currency: "usd",
                        customer: customer.id
                    }))
                .then(async(payment) => {
                    // Save first on database or not charge this customer
                    let invoice = await insertInvoice(payment, client_car);
                    if (invoice.status) {
                        charge => res.send(charge);
                        return res.status(200).json({
                            status: true,
                            statusCode: 200,
                            msg: 'Your payment has been completed successfully'
                        });
                    } else {
                        throw new Error('Failure to process your payment, please try later');
                    }
                })
                .catch(err => {
                    console.log("Error:", err);
                    res.status(500).send({ error: "Purchase Failed" });
                });
        } catch (error) {
            throw error;
        }
    }
});
let objectClient = (car_id) => {
    return new Promise((resolve, reject) => {
        car.findById(car_id).exec((err, carService) => {
            if (err) reject(err);
            if (!carService) reject(null);
            resolve({
                status: true,
                carService
            });
        });
    });
}
let insertInvoice = (stripeResponse, clientKey) => {
    return new Promise((resolve, reject) => {
        const StripePayment = new stripeDB({
            transaction_ref: stripeResponse.balance_transaction,
            payment_description: stripeResponse.description,
            currency: stripeResponse.currency,
            amount: stripeResponse.amount,
            create: stripeResponse.created,
            customer_key: stripeResponse.customer,
            dispute: stripeResponse.dispute,
            payment_status: stripeResponse.status,
            payment_system: stripeResponse.paid,
            card_type: stripeResponse.source.brand,
            client: clientKey
        });
        StripePayment.save((err, invoice) => {
            if (err) reject({ status: false, err });
            resolve({ status: true, invoice });
        });
    });
}

module.exports = app;