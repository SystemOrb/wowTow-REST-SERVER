const moongose = require('mongoose');
const Schema = moongose.Schema;
const BillingSchema = new Schema({
    payer_name: {
        type: String,
        required: true
    },
    payer_address: {
        type: String,
        required: true
    },
    payer_city: {
        type: String,
        required: true
    },
    payer_postcode: {
        type: Number,
        required: true
    },
    payer_country: {
        type: String,
        required: true
    },
    service: {
        type: Schema.Types.ObjectId,
        ref: 'paypal_payments',
        required: false
    }
});
module.exports = moongose.model('payment_address', BillingSchema);