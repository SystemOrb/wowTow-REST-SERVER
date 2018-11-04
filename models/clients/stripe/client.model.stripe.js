const moongose = require('mongoose');
const Schema = moongose.Schema;
const StripeCustomer = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    typePayment: {
        type: String,
        required: true
    },
    client_ip: {
        type: String,
        required: false
    },
    last4: {
        type: Number,
        required: false
    },
    brand: {
        type: String,
        required: false
    },
    exp_month: {
        type: String,
        required: false
    },
    exp_year: {
        type: String,
        required: false
    }
});
module.exports = moongose.model('customer_payment', StripeCustomer);