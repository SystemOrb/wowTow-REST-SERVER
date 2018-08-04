const moongose = require('mongoose');
const Schema = moongose.Schema;
const PAYPAL_PAYMENT = new Schema({
    item_name: {
        type: String,
        required: true
    },
    item_price: {
        type: Number,
        required: true
    },
    item_currency: {
        type: String,
        required: true
    },
    item_description: {
        type: String,
        required: true
    },
    payment_ref: {
        type: String,
        required: true
    },
    payment_date: {
        type: Date,
        required: true
    },
    payment_merchant: {
        type: String,
        required: true
    },
    payer_name: {
        type: String,
        required: true
    },
    payer_lastname: {
        type: String,
        required: true
    },
    payer_email: {
        type: String,
        required: true
    },
    payment_status: {
        type: Boolean,
        default: true
    },
    payment_method: {
        type: String,
        enum: {
            values: ['paypal', 'card', 'stripe'],
            message: '{VALUE} must be unique'
        },
        required: true
    }
});
module.exports = moongose.model('paypal_payments', PAYPAL_PAYMENT);