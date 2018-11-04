const express = require('express');
const app = express();
const secretKey = require('../../config/settings').StripeSecretKey;
const stripe = require('stripe')(secretKey);
const jwt = require('../../middlewares/protection');
const car = require('../../models/clients/client.car.model');
const stripeDB = require('../../models/clients/stripe/client.payment.stripe');
const customerPayment = require('../../models/clients/stripe/client.model.stripe');
const geolocation = require('../../models/backend/google/geolocation');
app.post("/charge", async(req, res) => {
    let client_car = req.query.carToken;
    let clientPaymentFromService = await objectClient(client_car);
    // Verify if this query have latitude and longitude
    if (req.query.fromLng !== '' && req.query.toLat != 0 && req.query.fromLat !== '' && req.query.toLng != 0) {
        if (clientPaymentFromService.status) {
            try {
                stripe.customers.create({
                        email: req.body.email,
                        card: req.body.id
                    })
                    .then(customer =>
                        stripe.charges.create({
                            amount: req.query.amount,
                            description: "Woowtow Recovery Service",
                            currency: "usd",
                            customer: customer.id
                        }))
                    .then(async(payment) => {
                        // Save first on database or not charge this customer
                        let invoice = await insertInvoice(payment, client_car);
                        // We save the coordinates for reference
                        if (invoice.status) {
                            const Coords = await insertGeoZoneReference(
                                invoice.invoice._id,
                                req.query.fromLng,
                                req.query.fromLat,
                                req.query.toLng,
                                req.query.toLat,
                                client_car
                            );
                            if (Coords.status) {
                                charge => res.send(charge);
                                return res.status(200).json({
                                    status: true,
                                    statusCode: 200,
                                    msg: 'Your payment has been completed successfully'
                                });
                            }
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
    }
});
app.post('/customer', async(req, res) => {
    const customer = await stripe.customers.create({
        email: req.body.email,
        card: req.body.id,
    });
    try {
        if (!customer.id) {
            return Response.status(400).json({
                status: false,
                statusCode: 400,
                msg: 'Cannot process your operation',

            });
        }
        const Afiliated = await customerAfiliatedPayment(customer, req.query.customer);
        if (!Afiliated.status) {
            return Response.status(400).json({
                status: false,
                statusCode: 400,
                msg: 'Cannot process your operation',
                err
            });
        }
        switch (Afiliated.method) {
            case 'update':
                const update = await updateAfiliatedPayment(Afiliated.customer, Afiliated.customer._id);
                if (update.status) {
                    // Charge the Customer instead of the card:
                    stripe.charges.create({
                            amount: req.query.amount,
                            description: "WoowTow Recovery",
                            currency: "usd",
                            customer: customer.id
                        }).then(async(payment) => {
                            // Save first on database or not charge this customer
                            let invoice = await insertInvoice(payment, req.query.customer);
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
                }
                break;
            case 'create':
                stripe.charges.create({
                        amount: req.query.amount,
                        description: "WoowTow Recovery",
                        currency: "usd",
                        customer: customer.id
                    }).then(async(payment) => {
                        // Save first on database or not charge this customer
                        let invoice = await insertInvoice(payment, req.query.customer);
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
                break;
        }
    } catch (error) {
        throw error;
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
let insertGeoZoneReference = (invoice_id, fromLng, fromLat, toLng, toLat, keyUser) => {
    return new Promise((resolve, reject) => {
        const coords = new geolocation({
            fromLng,
            fromLat,
            toLng,
            toLat,
            service_ref: invoice_id,
            customer: keyUser
        });
        coords.save((err, coordinates) => {
            if (err) {
                throw err;
            }
            resolve({ status: true, coordinates });
            return;
        });
    });
}
let customerAfiliatedPayment = (customer, _key) => {
    return new Promise((resolve, reject) => {
        const Customer = new customerPayment({
            email: customer.email,
            client: _key,
            typePayment: customer.type,
            client_ip: customer.client_ip,
            last4: customer.card.last4,
            brand: customer.card.brand,
            exp_month: customer.card.exp_month,
            exp_year: customer.card.exp_year
        });
        // Search first if this exists, we update 
        customerPayment.find({ email: customer.email, client: _key }).exec((err, customer) => {
            if (err) throw err;
            if (!customer) {
                // Is new User and he never payed on wowtow
                Customer.save((err, newCustomer) => {
                    if (err) reject({ status: false, err });
                    resolve({ status: true, newCustomer, method: 'create' })
                });
                return;
            }
            // Users found so we update if he changed any data            
            resolve({ status: true, customer, method: 'update' });
            return;
        });
    });
}
let updateAfiliatedPayment = (customerData, _id) => {
    return new Promise((resolve, reject) => {
        customerPayment.findByIdAndUpdate(_id, customerData)
            .exec((err, resp) => {
                if (err) throw err;
                resolve({ status: true, resp })
            });
    });
}

module.exports = app;