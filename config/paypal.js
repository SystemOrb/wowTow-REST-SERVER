/*
PAYPAL CONFIG
*/
"use strict";
const paypal = require('paypal-rest-sdk');
const client_id_sandbox = require('./settings').PaypalSandClientId;
const client_secret_sandbox = require('./settings').PaypalSandSecretId;
const client_id_live = require('./settings').PaypalLiveClientId;
const client_secret_live = require('./settings').PaypalLiveSecretId;
process.env.NODE_ENV = process.env.NODE_ENV || 'developer';
let live_config = {
    'mode': 'live',
    'client_id': client_id_live,
    'client_secret_live': client_secret_live
}
let sandbox_config = {
    'mode': 'sandbox',
    'client_id': client_id_sandbox,
    'client_secret': client_secret_sandbox
}
if (process.env.NODE_ENV === 'developer') {
    paypal.configure(sandbox_config);
} else {
    paypal.configure(live_config)
}


module.exports = paypal;