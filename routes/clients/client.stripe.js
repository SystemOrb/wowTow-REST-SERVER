const express = require('express');
const app = express();
const secretKey = require('../../config/settings').StripeSecretKey;
const stripe = require('stripe')('sk_test_dNPW5P5aMMQIxi5dPFIEIsCr'); // Test mode
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

/*
UPDATE AUGUST 2019
For Apps 
*/
/*
Cuando el cliente hace un pago por el servicio
El dinero queda en Hold, lo que haremos es crear un cliente
Cuando el conductor tome el servicio, nosotros listamos ese cliente que creo anteriormente xd
*/
app.post('/newAPI/customer', (req, res) => {
    let body = req.body;
    try {
        stripe.customers.list({
            email: body.email
        }, (errList, customer) => {
            if (errList) {
                return res.status(400).json({
                    status: false,
                    statusCode: 500,
                    msg: errList,
                });
            }
            // Verificamos si el cliente ya fue afiliado anteriormente, sino lo afiliamos a Stripe
            if (customer.data.length >= 1) {
                res.status(200).json({
                    status: true,
                    statusCode: 200,
                    customer: customer.data[0],
                });
            } else {
                // Lo registramos
                stripe.customers.create({
                    description: 'Cliente registrado desde la aplicación cliente',
                    name: body.name,
                    phone: body.phone,
                    email: body.email
                }, (err, customer) => {
                    if (err) {
                        return res.status(400).json({
                            status: false,
                            statusCode: 500,
                            msg: err,
                        });
                    }
                    res.status(200).json({
                        status: true,
                        statusCode: 200,
                        customer,
                    });
                });
            }
        });
    } catch (error) {
        throw error;
    }
});
/*
Objeto que se encarga de capturar el pago, y lo autoriza para emitirlo luego, es decir
Si el cliente solicita un servicio capturamos el pago con ciclo de 7 dias
Esto permitirá al cliente poder cancelar el servicio y emitir un reembolso
o una vez que un conductor haya tomado el servicio se procede a descontar el pago
*/
// El dinero se retiene, no procesa el pago aun
app.post('/newAPI/charge/capture', (req, res) => {
    let body = req.body;
    // Removemos los "." del número
    // Creamos un objeto Source con el cliente anteriormente creado
    try {
        stripe.customers.createSource(body.subscription.id, {
            source: body.token.id
        }, (err, sourcing) => {
            if (err) {
                return res.status(400).json({
                    status: false,
                    statusCode: 500,
                    msg1: err,
                });
            }
            stripe.charges.create({
                amount: body.prices.stripeAmount, // Monto total a pagar
                currency: 'usd', // La moneda
                customer: sourcing.customer,
                description: `Pago para un servicio desde: ${body.places.origin.text} hasta ${body.places.destiny.text}`,
                capture: false, // Retenemos el dinero, es decir queda en hold
                receipt_email: body.customer.email,
            }, (err, charge) => {
                if (err) {
                    return res.status(400).json({
                        status: false,
                        statusCode: 500,
                        msg2: err,
                    });
                }
                res.status(200).json({
                    status: true,
                    statusCode: 200,
                    charge
                });
            });
        })
    } catch (error) {
        throw error;
    }
});
/*
Si el conductor de la grua toma un servicio, el dinero que el cliente tiene en pendiente por cobrar
será depositado finalmente y se emitirá el pago, ya que el conductor tomo el servicio,
Cuando el cliente paga por el servicio, se coloca en pendiente, si el conductor toma el servicio
se hace el cobro pertinente
*/
app.post('/newAPI/charge/pending/:chId', (req, res) => {
    let chId = req.params.chId;
    try {
        // Procesamos el pago
        stripe.charges.capture(chId, (err, charge) => {
            if (err) {
                return res.status(400).json({
                    status: false,
                    statusCode: 500,
                    msg: err,
                });
            }
            // Emitio el pago
            res.status(200).json({
                status: true,
                statusCode: 200,
                charge
            });
        });
    } catch (error) {
        throw error;
    }
});
/*
Solicitar Reembolso, ya sea que el cliente quiere cancelar el servicio
por espera
*/
app.post('/newAPI/charge/refund/:chId', (req, res) => {
    let chId = req.params.chId;
    try {
        stripe.refunds.create({
            charge: chId,
            reason: 'requested_by_customer'
        }, (err, refund) => {
            if (err) {
                return res.status(400).json({
                    status: false,
                    statusCode: 500,
                    msg: err,
                });
            }
            // Reembolso solicitado
            res.status(200).json({
                status: true,
                statusCode: 200,
                refund
            });
        });
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