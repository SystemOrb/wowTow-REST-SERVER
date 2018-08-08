const moongose = require('mongoose');
const Schema = moongose.Schema;
const STRIPE = new Schema({
    transaction_ref: {
        type: String,
        required: true
    },
    payment_description: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    create: {
        type: Date,
        required: true
    },
    customer_key: {
        type: String,
        required: true
    },
    dispute: {
        type: Boolean,
        default: false
    },
    payment_status: {
        type: String,
        required: true
    },
    payment_system: {
        type: Boolean,
        required: true
    },
    card_type: {
        type: String,
        required: true
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'client_car',
        required: true
    }
});
module.exports = moongose.model('stripe_payments', STRIPE);